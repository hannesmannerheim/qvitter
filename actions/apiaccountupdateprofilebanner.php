<?php
 /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ·                                                                             ·
  ·  Update the profile banner                                                  ·
  ·                                                                             ·
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ·                                                                             ·
  ·                                                                             ·
  ·                             Q V I T T E R                                   ·
  ·                                                                             ·
  ·                      https://git.gnu.io/h2p/Qvitter                         ·
  ·                                                                             ·
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


if (!defined('GNUSOCIAL')) {
    exit(1);
}

class ApiAccountUpdateProfileBannerAction extends ApiAuthAction
{
    protected $needPost = true;

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

        $this->user = $this->auth_user;

        $this->cropW = $this->trimmed('width');
        $this->cropH = $this->trimmed('height');
        $this->cropX = $this->trimmed('offset_left');
        $this->cropY = $this->trimmed('offset_top');
        $this->img   = $this->trimmed('banner');

        return true;
    }

    /**
     * Handle the request
     *
     * @return void
     */
    protected function handle()
    {
        parent::handle();
        $profile = $this->user->getProfile();

        // see if we have regular uploaded image data
        try {

            $mediafile = MediaFile::fromUpload('banner', $profile);

        } catch (NoUploadedMediaException $e) {

            // if not we may have base64 data
    		$img = $this->img;
    		if(stristr($img, 'image/jpeg')) {
    			$img_mime = 'image/jpeg';
    			}
    		elseif(stristr($img, 'image/png')) {
    			// should convert to jpg here!!
    			$img_mime = 'image/png';
    			}

            // i don't remember why we had to do this
    		$img = str_replace('data:image/jpeg;base64,', '', $img);
    		$img = str_replace('data:image/png;base64,', '', $img);
    		$img = str_replace(' ', '+', $img);
    		$img = base64_decode($img, true);

            try {
    		    $img_filename = File::filename($profile, 'cover', $img_mime);
        		$img_path = File::path($img_filename);
        		$img_success = file_put_contents($img_path, $img);
        		$img_mimetype = MediaFile::getUploadedMimeType($img_path, $img_filename);
                $mediafile = new MediaFile($profile, $img_filename, $img_mimetype);
            } catch (Exception $e) {
                $this->clientError($e, 400);
            }
        }

        if(!$mediafile instanceof MediaFile) {
            $this->clientError(_('Could not process image data.'), 400);
        }

        // maybe resize
        $width = $this->cropW;
        $height = $this->cropH;
        $scale = 1;
        if($width > 1200) {
            $scale = 1200/$width;
        } elseif($height > 600) {
            $scale = 600/$height;
        }
        $width = round($width*$scale);
        $height = round($height*$scale);

        // crop
        try {
     		$imagefile = new ImageFile($mediafile->fileRecord->id, File::path($mediafile->filename));
      		$imagefile->resizeTo(File::path($mediafile->filename), array('width'=>$width, 'height'=>$height, 'x'=>$this->cropX, 'y'=>$this->cropY, 'w'=>$this->cropW, 'h'=>$this->cropH));
    		$result['url'] = File::url($mediafile->filename);
        } catch (Exception $e) {
            $this->clientError(_('The image could not be resized and cropped. '.$e), 422);
        }

        // save in profile_prefs
        try {
		    Profile_prefs::setData($profile, 'qvitter', 'cover_photo', $result['url']);
        } catch (ServerException $e) {
            $this->clientError(_('The image could not be resized and cropped. '.$e), 422);
        }

        // return json
        $this->initDocument('json');
        $this->showJsonObjects($result);
        $this->endDocument('json');
    }
}
