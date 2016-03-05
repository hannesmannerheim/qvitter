<?php
 /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ·                                                                             ·
  ·  Update the avatar
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

class ApiUpdateAvatarAction extends ApiAuthAction
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
        $this->cropH = $this->trimmed('cropH');
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
        // write the image to a temporary file
        $fh = tmpfile();
        fwrite($fh, $this->img);
        unset($this->img);  // no need to keep it in memory
        // seek back to position 0, so we don't read EOF directly
        fseek($fh, 0);
        // read the temporary file as an uploaded image, will store File object
        $mediafile = MediaFile::fromFilehandle($fh, $this->scoped);
        // Deletes the temporary file, if it was needed we stored it in fromFilehandle
        fclose($fh);

        // Now try to get it as an ImageFile since it has some handy functions
        $imagefile = ImageFile::fromFileObject($mediafile->fileRecord);
        unset($mediafile);  // This isn't needed in memory.

        // Get an appropriate filename for the avatar
        $filename = Avatar::filename(
            $this->scoped->getID(),
            image_type_to_extension($imagefile->preferredType()),
            null,
            common_timestamp()
        );
        $imagefile->resizeTo(Avatar::path($filename), array('width'=>$this->cropW, 'height'=>$this->cropH, 'x'=>$this->cropX, 'y'=>$this->cropY, 'w'=>$this->cropW, 'h'=>$this->cropH));

        $this->scoped->setOriginal($filename);

        $twitter_user = $this->twitterUserArray($this->scoped, true);
        $this->initDocument('json');
        $this->showJsonObjects($twitter_user);
        $this->endDocument('json');
	}
}
