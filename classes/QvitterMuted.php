<?php

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   ·                                                                            ·
   ·  Get muted profiles for a profile                                          ·
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

class QvitterMuted
{

    public static function getMutedProfiles($profile_id, $offset = 0, $limit = PROFILES_PER_PAGE)
    {

        $ids = self::getMutedIDs($profile_id, $offset, $limit);

        if(count($ids) === 0) {
            return false;
        } else {
            $profiles = array();
            foreach($ids as $id) {
                try {
                    $profiles[] = Profile::getByID($id);
                } catch (Exception $e) {
                    //
                }
            }
            if(count($profiles) === 0) {
                return false;
            } else {
                return $profiles;
            }
        }
    }


    public static function getMutedIDs($profile_id, $offset, $limit)
    {

        if(!is_numeric($profile_id)) {
            return false;
        }

        $mutes = new Profile_prefs();
        $mutes->selectAdd('topic');
        $mutes->whereAdd("profile_id = ".$profile_id);
        $mutes->whereAdd("namespace = 'qvitter'");
        $mutes->whereAdd("data = '1'");
        $mutes->whereAdd("topic LIKE 'mute:%'");
        $mutes->orderBy('modified DESC');
        $mutes->limit($offset, $limit);

        if (!$mutes->find()) {
            return array();
        }

        $topics = $mutes->fetchAll('topic');
        $ids = array();
        foreach($topics as $topic) {
            $topic_exploded = explode(':',$topic);
            if(is_numeric($topic_exploded[1])) {
                $ids[] = $topic_exploded[1];
            }
        }

        return $ids;
    }


}
