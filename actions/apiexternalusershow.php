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

        $this->format = 'json';        

        $profileurl = urldecode($this->arg('profileurl'));
        $nickname = urldecode($this->arg('nickname'));

		$this->profile = new stdClass();
		$this->profile->external = null;
		$this->profile->local = null;

		// we can get urls of two types of urls 	(1) ://instance/nickname
		//						    				(2) ://instance/user/1234
		//
		// in case (1) we have the problem that the html can be outdated,
		// i.e. the user can have changed her nickname. we also have no idea
		// if it is a multi or single user instance, which forces us to
		// guess the api root url.
		//
		// in case (2) we have another problem: we can't use that url to find
		// the local profile for the external user, we need url:s of type (2)
		// for that. so we have to try getting the nickname from the external
		// instance first


		// case (2)
		if(strstr($profileurl, '/user/')) {

			$external_user_id = substr($profileurl,strpos($profileurl,'/user/')+6);
			$external_instance_url = substr($profileurl,0,strpos($profileurl,'/user/')+1);

			if(!is_numeric($external_user_id)) {
				return true;
				}

			$external_profile = $this->getProfileFromExternalInstance($external_instance_url,$external_user_id);

			if(!isset($external_profile->statusnet_profile_url)) {
				return true;
				}

			$this->profile->external = $external_profile;
			$local_profile = Profile::getKV('profileurl',$external_profile->statusnet_profile_url);

			if(!$local_profile instanceof Profile) {
				return true;
				}

			$this->profile->local = $this->twitterUserArray($local_profile);
			return true;
			}

		// case (1)
		$local_profile = Profile::getKV('profileurl',$profileurl);

		if($local_profile instanceof Profile) {

			// if profile url is not ending with nickname, this is probably a single user instance
			if(!substr($local_profile->profileurl, -strlen($local_profile->nickname))===$local_profile->nickname) {
				$external_instance_url = $local_profile->profileurl;
				}
			// multi user instance
			else {
				$external_instance_url = substr($local_profile->profileurl, 0, strrpos($local_profile->profileurl, '/'));
				}

			$external_profile = $this->getProfileFromExternalInstance($external_instance_url,$local_profile->nickname);

			if(!isset($external_profile->statusnet_profile_url)) {
				return true;
				}

			$this->profile->external = $external_profile;
			$this->profile->local = $this->twitterUserArray($local_profile);
			return true;
			}

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

        if(is_null($this->profile->local) && is_null($this->profile->external)) {
            $this->clientError(_('List not found.'), 404);
        } else {
            $this->initDocument('json');
        	$this->showJsonObjects($this->profile);
            $this->endDocument('json');
        }
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
     * Get profile from external instance
     *
     * @return null or profile object
     */
	function getProfileFromExternalInstance($instance_url,$user_id_or_nickname)
	{
		$apicall = $instance_url.'/api/users/show.json?id='.$user_id_or_nickname;
        $client = new HTTPClient();
        $response = $client->get($apicall);
        // json_decode returns null if it fails to decode
        return $response->isOk() ? json_decode($response->getBody()) : null;
	}


}
