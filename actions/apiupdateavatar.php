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
  ·              http://github.com/hannesmannerheim/qvitter                     ·
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

        $this->user = $this->auth_user;

        $this->cropW = $this->trimmed('cropW');
        $this->cropH = $this->trimmed('cropH');
        $this->cropX = $this->trimmed('cropX');
        $this->cropY = $this->trimmed('cropY');
        $this->img   = $this->trimmed('img');        
        
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
		$base64img = $this->img;
		if(stristr($base64img, 'image/jpeg')) {
			$base64img_mime = 'image/jpeg';
			}
		elseif(stristr($base64img, 'image/png')) {
			// should convert to jpg here!!
			$base64img_mime = 'image/png';
			}
		$base64img = str_replace('data:image/jpeg;base64,', '', $base64img);
		$base64img = str_replace('data:image/png;base64,', '', $base64img); 			 			
		$base64img = str_replace(' ', '+', $base64img);
		$base64img_hash = md5($base64img);
		$base64img = base64_decode($base64img);
		$base64img_basename = basename('avatar');
		$base64img_filename = File::filename($profile, $base64img_basename, $base64img_mime);
		$base64img_path = File::path($base64img_filename);
		$base64img_success = file_put_contents($base64img_path, $base64img);
		$base64img_mimetype = MediaFile::getUploadedMimeType($base64img_path, $base64img_filename);
		$mediafile = new MediaFile($profile, $base64img_filename, $base64img_mimetype);
 		$imagefile = new ImageFile($mediafile->fileRecord->id, File::path($mediafile->filename));
  		$imagefile->resizeTo(File::path($mediafile->filename), array('width'=>$this->cropW, 'height'=>$this->cropH, 'x'=>$this->cropX, 'y'=>$this->cropY, 'w'=>$this->cropW, 'h'=>$this->cropH));			
		
        $type = $imagefile->preferredType();
        $filename = Avatar::filename(
            $profile->id,
            image_type_to_extension($type),
            null,
            common_timestamp()
        );

        $filepath = Avatar::path($filename);

        $imagefile->copyTo($filepath);

        $profile = $this->user->getProfile();
        $profile->setOriginal($filename);
        
        $mediafile->delete();

        $twitter_user = $this->twitterUserArray($profile, true);
        $this->initDocument('json');
        $this->showJsonObjects($twitter_user);
        $this->endDocument('json');
	}
}
