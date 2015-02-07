<?php
/**
 * StatusNet, the distributed open-source microblogging tool
 *
 * Show an external user's profile information
 *
 * PHP version 5
 *
 * LICENCE: This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @category  API
 * @package   GNUsocial
 * @author    Hannes Mannerheim <h@nnesmannerhe.im>
 * @license   http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License version 3.0
 * @link      http://www.gnu.org/software/social/
 */

if (!defined('GNUSOCIAL')) { exit(1); }

/**
 * Ouputs information for a user, specified by ID or screen name.
 * The user's most recent status will be returned inline.
 */
class ApiExternalUserShowAction extends ApiPrivateAuthAction
{
    /**
     * Take arguments for running
     *
     * @param array $args $_REQUEST args
     *
     * @return boolean success flag
     *
     */
    protected function prepare(array $args=array())
    {
        parent::prepare($args);

        $profileurl = urldecode($this->arg('profileurl'));        

		// if this is an instance/user/1234 type url, try to find real profile url 
		if(strstr($profileurl, '/user/')) {

			$redrected_profileurl = $this->getRedirectUrl($profileurl);
            if (!empty($redrected_profileurl)) {
				$profileurl = $redrected_profileurl;
			}
			
		}
		
		// get local profile
		$local_profile = Profile::getKV('profileurl',$profileurl);

		$this->profile = new stdClass();

		if($local_profile) {
			$this->profile->local = $this->twitterUserArray($local_profile);

			$username = $this->profile->local['screen_name'];	
			
			// if profile url is not ending with nickname, this is probably a single user instance
			if(!substr($profileurl, -strlen($username))===$username) {
				$instanceurl = $profileurl;
				}

			// multi user instance
			else {			
				$instanceurl = substr($profileurl, 0, strrpos($profileurl, '/'));				
				}			
			
			}
		
		// we don't know this user
		else {
			
			// if profile url ends with '/' this is probably an unknown single user instance
			if(substr($profileurl, -1)==='/') {
				$instanceurl = $profileurl;
				$username = 1;		
				}

			// multi user instance
			else {
				$username = substr($profileurl, strrpos($profileurl, '/')+1);			
				$instanceurl = substr($profileurl, 0, strrpos($profileurl, '/'));											
				}			
			
			}
		
		// get profile from external instance
		$apicall = $instanceurl.'/api/users/show.json?id='.$username; 	
        $client = new HTTPClient();
        $response = $client->get($apicall);
        // json_decode returns null if it fails to decode
        $this->profile->external = $response->isOk() ? json_decode($response->getBody()) : null;

        return true;
    }

    /**
     * Handle the request
     *
     * Check the format and show the user info
     *
     * @param array $args $_REQUEST data (unused)
     *
     * @return void
     */
    protected function handle()
    {
        parent::handle();

        $this->initDocument('json');
		$this->showJsonObjects($this->profile);
        $this->endDocument('json');
    }

    /**
     * Return true if read only.
     *
     * MAY override
     *
     * @param array $args other arguments
     *
     * @return boolean is read only action?
     */
    function isReadOnly($args)
    {
        return true;
    }
    

    /**
     * Get redirect(s) for an url
     *
     * @return mixed  Location URL if redirect, null if no Location header (through HTTP_Request2_Response getHeader())
     */
	function getRedirectUrl ($url) {
        $client = new HTTPClient();
        $response = $client->head($url);
        return $response->getHeader('Location');    // null if it isn't set
	}


    
}
