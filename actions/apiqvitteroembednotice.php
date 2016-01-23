<?php

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   ·                                                                            ·
   ·  Qvitter's Oembed response for notices                                     ·
   ·                                                                            ·
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ·                                                                             ·
  ·                                                                             ·
  ·                             Q V I T T E R                                   ·
  ·                                                                             ·
  ·                      https://git.gnu.io/h2p/Qvitter                         ·
  ·                                                                             ·
  ·                                                                             ·
  ·                                 <o)                                         ·
  ·                                  /_////                                     ·
  ·                                 (____/                                      ·
  ·                                          (o<                                ·
  ·                                   o> \\\\_\                                 ·
  ·                                 \\)   \____)                                ·
  ·                                                                             ·
  ·                                                                             ·
  ·                                                                             ·
  ·  Qvitter is free  software:  you can  redistribute it  and / or  modify it  ·
  ·  under the  terms of the GNU Affero General Public License as published by  ·
  ·  the Free Software Foundation,  either version three of the License or (at  ·
  ·  your option) any later version.                                            ·
  ·                                                                             ·
  ·  Qvitter is distributed  in hope that  it will be  useful but  WITHOUT ANY  ·
  ·  WARRANTY;  without even the implied warranty of MERCHANTABILTY or FITNESS  ·
  ·  FOR A PARTICULAR PURPOSE.  See the  GNU Affero General Public License for  ·
  ·  more details.                                                              ·
  ·                                                                             ·
  ·  You should have received a copy of the  GNU Affero General Public License  ·
  ·  along with Qvitter. If not, see <http://www.gnu.org/licenses/>.            ·
  ·                                                                             ·
  ·  Contact h@nnesmannerhe.im if you have any questions.                       ·
  ·                                                                             ·
  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · */


if (!defined('GNUSOCIAL')) { exit(1); }

class ApiQvitterOembedNoticeAction extends ApiAction
{
    var $format = null;
    var $url = null;

    /**
     * Take arguments for running
     *
     * @param array $args $_REQUEST args
     *
     * @return boolean success flag
     */
    protected function prepare(array $args=array())
    {
        parent::prepare($args);

        $this->format = $this->arg('format');
        $this->url = $this->arg('url');

        return true;
    }

    /**
     * Handle the request
     *
     * @param array $args $_REQUEST data (unused)
     *
     * @return void
     */
    protected function handle()
    {
        parent::handle();

        $noticeurl = common_path('notice/', StatusNet::isHTTPS());
        $instanceurl = common_path('', StatusNet::isHTTPS());

        // remove protocol for the comparison below
        $noticeurl_wo_protocol = preg_replace('(^https?://)', '', $noticeurl);
        $instanceurl_wo_protocol = preg_replace('(^https?://)', '', $instanceurl);
        $url_wo_protocol = preg_replace('(^https?://)', '', $this->url);

        // find local notice
        if(strpos($url_wo_protocol, $noticeurl_wo_protocol) === 0) {
            $possible_notice_id = str_replace($noticeurl_wo_protocol,'',$url_wo_protocol);
            if(ctype_digit($possible_notice_id)) {
                $notice = Notice::getKV('id',$possible_notice_id);;
            } else {
                $this->clientError("Notice not found.", 404);
            }
        }

		if(!$notice instanceof Notice){
			// TRANS: Client error displayed in oEmbed action when notice not found.
			// TRANS: %s is a notice.
			$this->clientError(sprintf(_("Notice %s not found."),$this->id), 404);
		}
		$profile = $notice->getProfile();
		if (!$profile instanceof Profile) {
			// TRANS: Server error displayed in oEmbed action when notice has not profile.
			$this->serverError(_('Notice has no profile.'), 500);
		}
		$authorname = $profile->getFancyName();

        $oembed=array();
        $oembed['version']='1.0';
        $oembed['provider_name']=common_config('site', 'name');
        $oembed['provider_url']=common_root_url();
        $oembed['type']='link';

		// TRANS: oEmbed title. %1$s is the author name, %2$s is the creation date.
		$oembed['title'] = ApiAction::dateTwitter($notice->created).' (Qvitter)';
		$oembed['author_name']=$authorname;
		$oembed['author_url']=$profile->profileurl;
		$oembed['url']=$notice->getUrl();
		$oembed['html']=$notice->getRendered();

        // maybe add thumbnail
        $attachments = $notice->attachments();
        if (!empty($attachments)) {
            foreach ($attachments as $attachment) {
				if(is_object($attachment)) {
                    try {
                        $thumb = $attachment->getThumbnail();
					} catch (ServerException $e) {
                        //
                    }
                    if(!empty($thumb) && method_exists('File_thumbnail','url')) {
                        try {
                            $thumb_url = File_thumbnail::url($thumb->filename);
                            $oembed['thumbnail_url'] = $thumb_url;
                            break; // only first one
                        } catch (ClientException $e) {
                            //
                        }
                    }
                }
            }
        }

        if($this->format == 'json') {
            $this->initDocument('json');
            print json_encode($oembed);
            $this->endDocument('json');
        } elseif ($this->format == 'xml') {
            $this->initDocument('xml');
            $this->elementStart('oembed');
            foreach(array(
                        'version', 'type', 'provider_name',
                        'provider_url', 'title', 'author_name',
                        'author_url', 'url', 'html'
                        ) as $key) {
                if (isset($oembed[$key]) && $oembed[$key]!='') {
                    $this->element($key, null, $oembed[$key]);
                }
            }
            $this->elementEnd('oembed');
            $this->endDocument('xml');
        } else {
            $this->serverError(sprintf(_('Format %s not supported.'), $this->format), 501);
        }
    }
}
