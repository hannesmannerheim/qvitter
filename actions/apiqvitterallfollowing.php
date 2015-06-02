<?php

 /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ·                                                                             · 
  ·  Everybody I'm following and all groups I'm member of                       ·
  ·  (to use for auto-suggestions)                                              · 
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



if (!defined('GNUSOCIAL')) { exit(1); }

class ApiQvitterAllFollowingAction extends ApiBareAuthAction
{

    var $profiles = null;
  	var $users_stripped = null;

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

        $this->count = 5000; // max 5000, completely arbitrary...

        $this->target = $this->getTargetProfile($this->arg('id'));


        if (!($this->target instanceof Profile)) {
            // TRANS: Client error displayed when requesting a list of followers for a non-existing user.
            $this->clientError(_('No such user.'), 404);
        }

        $this->profiles = $this->getProfiles();

		
		// only keep id, name, nickname and avatar URL
		foreach($this->profiles as $p) {
			try {
				$avatar = Avatar::byProfile($p, AVATAR_STREAM_SIZE);
				$avatar = $avatar->url;
			} catch (Exception $e) {
				$avatar = false;
			}			
			$this_user = array($p->fullname,$p->nickname,$avatar);
			if(!$p->isLocal()) {
				$this_user[3] = $p->getUrl();
				}
			else {
				$this_user[3] = false;
				}
			$this->users_stripped[$p->id] = $this_user;
			}

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
    

        $this->initDocument('json');
        $this->showJsonObjects($this->users_stripped);
        $this->endDocument('json');
    }
    
    /**
     * Get profiles
     *
     * @return array Profiles
     */
    protected function getProfiles()
    {
        $offset = ($this->page - 1) * $this->count;
        $limit =  $this->count + 1;

        $subs = null;

        if (isset($this->tag)) {
            $subs = $this->target->getTaggedSubscriptions(
                $this->tag, $offset, $limit
            );
        } else {
            $subs = $this->target->getSubscribed(
                $offset,
                $limit
            );
        }

        $profiles = array();

        while ($subs->fetch()) {
            $profiles[] = clone($subs);
        }

        return $profiles;
    }

}
