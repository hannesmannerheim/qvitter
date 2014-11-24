<?php

 /* · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·  
  ·                                                                             ·
  ·                                                                             ·
  ·                             Q V I T T E R                                   ·
  ·                                                                             ·
  ·              http://github.com/hannesmannerheim/qvitter                     ·
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

class ApiToggleQvitterAction extends ApiAuthAction
{

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

        return true;
    }

    /**
     * Handle the request
     *
     * Try to save the user's colors in her design. Create a new design
     * if the user doesn't already have one.
     *
     * @param array $args $_REQUEST data (unused)
     *
     * @return void
     */
    protected function handle()
    {
        parent::handle();

        $user = common_current_user();
		$profile = $user->getProfile();
		
		if(QvitterPlugin::settings('enabledbydefault')) {
			$state = Profile_prefs::getConfigData($profile, 'qvitter', 'disable_qvitter');
			if($state == 1) {
				Profile_prefs::setData($profile, 'qvitter', 'disable_qvitter', 0);							
				}
			else {
				Profile_prefs::setData($profile, 'qvitter', 'disable_qvitter', 1);											
				}
			}
		else {
			$state = Profile_prefs::getConfigData($profile, 'qvitter', 'enable_qvitter');
			if($state == 1) {
				Profile_prefs::setData($profile, 'qvitter', 'enable_qvitter', 0);							
				}
			else {
				Profile_prefs::setData($profile, 'qvitter', 'enable_qvitter', 1);											
				}
			}
			
		
		$result['success'] = true;
		
        $this->initDocument('json');
        $this->showJsonObjects($result);
        $this->endDocument('json');
    }
}
