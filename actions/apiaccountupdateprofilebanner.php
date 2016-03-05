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

        $this->format = 'json';

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

        // see if we have regular uploaded image data
        try {

            $mediafile = MediaFile::fromUpload('banner', $this->scoped);

        } catch (NoUploadedMediaException $e) {

            // if not we may have base64 data

            $this->img = str_replace('data:image/jpeg;base64,', '', $this->img);
            $this->img = str_replace('data:image/png;base64,', '', $this->img);
            $this->img = str_replace(' ', '+', $this->img);
            $this->img = base64_decode($this->img, true);

            $fh = tmpfile();
            fwrite($fh, $this->img);
            unset($this->img);
            fseek($fh, 0);

            $mediafile = MediaFile::fromFilehandle($fh, $this->scoped);
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
            $imagefile = ImageFile::fromFileObject($mediafile->fileRecord);
            unset($mediafile);

            // We're just using the Avatar function to build a filename here
            // but we don't save it _as_ an avatar below... but in the same dir!
            $filename = Avatar::filename(
                $this->scoped->getID(),
                image_type_to_extension($imagefile->preferredType()),
                null,
                'banner-'.common_timestamp()
            );

            $imagefile->resizeTo(Avatar::path($filename), array('width'=>$width, 'height'=>$height, 'x'=>$this->cropX, 'y'=>$this->cropY, 'w'=>$this->cropW, 'h'=>$this->cropH));
            $result['url'] = Avatar::url($filename);
        } catch (Exception $e) {
            $this->clientError(_('The image could not be resized and cropped. '.$e), 422);
        }

        // save in profile_prefs
        try {
		    Profile_prefs::setData($this->scoped, 'qvitter', 'cover_photo', $result['url']);
        } catch (ServerException $e) {
            $this->clientError(_('The image could not be resized and cropped. '.$e), 422);
        }

        // return json
        $this->initDocument('json');
        $this->showJsonObjects($result);
        $this->endDocument('json');
    }
}
