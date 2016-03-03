<?php

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   ·                                                                            ·
   ·  API for getting all muted profiles for a profile                        ·
   ·                                                                            ·
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ·                                                                             ·
  ·                                                                             ·
  ·                             Q V I T T E R                                   ·
  ·                                                                             ·
  ·                      https://git.gnu.io/h2p/Qvitter                         ·
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


class ApiQvitterMutesAction extends ApiPrivateAuthAction
{
    var $profiles = null;

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

        $this->count    =  (int)$this->arg('count', 100);

        return true;
    }

    /**
     * Handle the request
     *
     * Show the profiles
     *
     * @return void
     */
    protected function handle()
    {
        parent::handle();

        $this->target = Profile::current();

		if(!$this->target instanceof Profile) {
			$this->clientError(_('You have to be logged in to view your mutes.'), 403);
			}

        $this->profiles = $this->getProfiles();

        $this->initDocument('json');
        print json_encode($this->showProfiles());
        $this->endDocument('json');
    }

    /**
     * Get the user's muted profiles
     *
     * @return array Profiles
     */
    protected function getProfiles()
    {
        $offset = ($this->page - 1) * $this->count;
        $limit =  $this->count;

		$mutes = QvitterMuted::getMutedProfiles($this->target->id, $offset, $limit);

        if($mutes) {
            return $mutes;
        } else {
            return false;
        }
    }

    /**
     * Is this action read only?
     *
     * @param array $args other arguments
     *
     * @return boolean true
     */
    function isReadOnly($args)
    {
        return true;
    }

    /**
     * When was this feed last modified?
     *
     * @return string datestamp of the latest profile in the stream
     */
    function lastModified()
    {
        if (!empty($this->profiles) && (count($this->profiles) > 0)) {
            return strtotime($this->profiles[0]->modified);
        }

        return null;
    }

    /**
     * An entity tag for this action
     *
     * Returns an Etag based on the action name, language, user ID, and
     * timestamps of the first and last profiles in the subscriptions list
     * There's also an indicator to show whether this action is being called
     * as /api/statuses/(friends|followers) or /api/(friends|followers)/ids
     *
     * @return string etag
     */
    function etag()
    {
        if (!empty($this->profiles) && (count($this->profiles) > 0)) {

            $last = count($this->profiles) - 1;

            return '"' . implode(
                ':',
                array($this->arg('action'),
                      common_user_cache_hash($this->auth_user),
                      common_language(),
                      $this->target->id,
                      'Profiles',
                      strtotime($this->profiles[0]->modified),
                      strtotime($this->profiles[$last]->modified))
            )
            . '"';
        }

        return null;
    }

    /**
     * Show the profiles as Twitter-style useres and statuses
     *
     * @return void
     */
    function showProfiles()
    {
		$user_arrays = array();
        if($this->profiles !== false) {
    		foreach ($this->profiles as $profile) {
    			$user_arrays[] = $this->twitterUserArray($profile, false );
    		}
        }
		return $user_arrays;
    }
}
