<?php
 /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ·                                                                             ·
  ·  Update the cover photo                                                     ·
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

class ApiUpdateBackgroundImageAction extends ApiAuthAction
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

        $this->cropW = $this->trimmed('cropW');
        $this->cropH = $this->trimmed('cropW'); // note W, we want a square
        $this->cropX = $this->trimmed('cropX');
        $this->cropY = $this->trimmed('cropY');
        $this->img   = $this->trimmed('img');

        $this->img = str_replace('data:image/jpeg;base64,', '', $this->img);
        $this->img = str_replace('data:image/png;base64,', '', $this->img);
        $this->img = str_replace(' ', '+', $this->img);
        $this->img = base64_decode($this->img);

        if (empty($this->img)) {
            throw new ClientException(_('No uploaded image data.'));
        }

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

        $imagefile = null;

        // put the image data in a temporary file
        $fh = tmpfile();
        fwrite($fh, $this->img);
        unset($this->img);
        fseek($fh, 0);  // go to beginning just to be sure the content is read properly

        // We get a MediaFile with a File object using the filehandle
        $mediafile = MediaFile::fromFilehandle($fh, $this->scoped);
        // and can dispose of the temporary filehandle since we're certain we have a File on disk now
        fclose($fh);

        $imagefile = ImageFile::fromFileObject($mediafile->fileRecord);
        unset($mediafile);  // No need to keep the MediaFile around anymore, everything we need is in ImageFile

        // We're just using the Avatar function to build a filename here
        // but we don't save it _as_ an avatar below... but in the same dir!
        $filename = Avatar::filename(
            $this->scoped->getID(),
            image_type_to_extension($imagefile->preferredType()),
            null,
            'bg-'.common_timestamp()
        );

        $imagefile->resizeTo(Avatar::path($filename), array('width'=>1280, 'height'=>1280, 'x'=>$this->cropX, 'y'=>$this->cropY, 'w'=>$this->cropW, 'h'=>$this->cropH));
		$result['url'] = Avatar::url($filename);

		Profile_prefs::setData($this->scoped, 'qvitter', 'background_image', $result['url']);

        $this->initDocument('json');
        $this->showJsonObjects($result);
        $this->endDocument('json');
    }
}
