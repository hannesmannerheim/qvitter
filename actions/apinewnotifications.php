<?php
/**
 *
 * Qvitter: Unread notifications
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

class ApiNewNotificationsAction extends ApiAction
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
     * @param array $args $_REQUEST data (unused)
     *
     * @return void
     */
    protected function handle()
    {
        parent::handle();


		$new_notifications = array();
		if(Profile::current()) {
			$user_id = Profile::current()->id;
			$notification = new QvitterNotification();

			$notification->selectAdd();
			$notification->selectAdd('ntype');
			$notification->selectAdd('count(id) as count');        
			$notification->whereAdd("(to_profile_id = '".$user_id."')");
			$notification->groupBy('ntype');        
			$notification->whereAdd("(is_seen = '0')");
			$notification->find();
		
			while ($notification->fetch()) {
				$new_notifications[$notification->ntype] = $notification->count;
				}					
			}
        else {
        	$new_notifications = 'You must be logged in.';
        	} 

	
		$this->initDocument('json');
		$this->showJsonObjects($new_notifications);
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
