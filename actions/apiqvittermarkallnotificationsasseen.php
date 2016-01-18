<?php

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   ·                                                                            ·
   ·  Say hello to the API                                                      ·
   · (you will also get headers with e.g. unread notification count....)        ·
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

class ApiQvitterMarkAllNotificationsAsSeenAction extends ApiAuthAction
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

        $n = new QvitterNotification();
        $n->selectAdd();
        $n->selectAdd('id');
        $n->whereAdd(sprintf('qvitternotification.to_profile_id = "%s"', $n->escape($this->auth_user->id)));
        $ids = $n->fetchAll('id');
        $notifications = QvitterNotification::pivotGet('id', $ids);
        $notifications = new ArrayWrapper($notifications);
        $notifications = $notifications->fetchAll();
        foreach($notifications as $notification) {
            if($notification->is_seen == 0) {
                $orig = clone($notification);
                $notification->is_seen = 1;
                $notification->update($orig);
                }
            }

        $this->initDocument('json');
        $this->showJsonObjects(true);
        $this->endDocument('json');
    }
}
