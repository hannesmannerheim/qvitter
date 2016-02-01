<?php
/**
 * StatusNet, the distributed open-source microblogging tool
 *
 * Returns both favs and repeats for a notice
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
class ApiFavsAndRepeatsAction extends ApiPrivateAuthAction
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

        $this->notice_id = $this->trimmed('notice_id');

        $this->original = Notice::getKV('id', $this->notice_id);

        if (empty($this->original)) {
            // TRANS: Client error displayed trying to display redents of a non-exiting notice.
            $this->clientError(_('No such notice.'), 400);
            return false;
        }

        $cnt = $this->trimmed('count');

        if (empty($cnt) || !is_integer($cnt)) {
            $this->cnt = 100;
        } else {
            $this->cnt = min((int)$cnt, self::MAXCOUNT);
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


        // since this api method is in practice only used when expanding a
        // notice, we can assume the user has seen the notice in question,
        // an no longer need a notification about it. mark reply/mention-
        // notifications tied to this notice and the current profile as read
        if($this->auth_user) {
            QvitterPlugin::markNotificationAsSeen($this->notice_id,$this->auth_user->id,'mention');
            QvitterPlugin::markNotificationAsSeen($this->notice_id,$this->auth_user->id,'reply');
        }


        // favs
        $fave = new Fave();
        $fave->selectAdd();
        $fave->selectAdd('user_id');
        $fave->selectAdd('modified');
        $fave->notice_id = $this->original->id;
        $fave->orderBy('modified');
        if (!is_null($this->cnt)) {
            $fave->limit(0, $this->cnt);
        }
		$fav_ids = $fave->fetchAll('user_id', 'modified');

		// get nickname and profile image
		$fav_ids_with_profile_data = array();
		$i=0;
		foreach($fav_ids as $id=>$time) {
			$profile = Profile::getKV('id', $id);
			$fav_ids_with_profile_data[$i]['user_id'] = $id;
			$fav_ids_with_profile_data[$i]['nickname'] = $profile->nickname;
			$fav_ids_with_profile_data[$i]['fullname'] = $profile->fullname;
			$fav_ids_with_profile_data[$i]['profileurl'] = $profile->profileurl;
			$fav_ids_with_profile_data[$i]['time'] = strtotime($time);
			$profile = new Profile();
			$profile->id = $id;
			$avatarurl = $profile->avatarUrl(48);
			$fav_ids_with_profile_data[$i]['avatarurl'] = $avatarurl;
			$i++;
		}


        // repeats
        $notice = new Notice();
        $notice->selectAdd(); // clears it
        $notice->selectAdd('profile_id');
        $notice->selectAdd('created');
        $notice->repeat_of = $this->original->id;
        $notice->verb =  ActivityVerb::SHARE;
        $notice->orderBy('created, id'); // NB: asc!
        if (!is_null($this->cnt)) {
            $notice->limit(0, $this->cnt);
        }
        $repeat_ids = $notice->fetchAll('profile_id','created');

		// get nickname and profile image
		$repeat_ids_with_profile_data = array();
		$i=0;
		foreach($repeat_ids as $id=>$time) {
			$profile = Profile::getKV('id', $id);
			$repeat_ids_with_profile_data[$i]['user_id'] = $id;
			$repeat_ids_with_profile_data[$i]['nickname'] = $profile->nickname;
			$repeat_ids_with_profile_data[$i]['fullname'] = $profile->fullname;
			$repeat_ids_with_profile_data[$i]['profileurl'] = $profile->profileurl;
			$repeat_ids_with_profile_data[$i]['time'] = strtotime($time);
			$profile = new Profile();
			$profile->id = $id;
			$avatarurl = $profile->avatarUrl(48);
			$repeat_ids_with_profile_data[$i]['avatarurl'] = $avatarurl;
			$i++;
		}

        $favs_and_repeats = array('favs'=>$fav_ids_with_profile_data,'repeats'=>$repeat_ids_with_profile_data);

        $this->initDocument('json');
		$this->showJsonObjects($favs_and_repeats);
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



}
