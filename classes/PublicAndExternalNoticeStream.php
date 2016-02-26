<?php

 /* · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
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


if (!defined('STATUSNET')) {
    exit(1);
}

class PublicAndExternalNoticeStream extends ScopingNoticeStream
{
    function __construct($profile=null)
    {

        parent::__construct(new CachingNoticeStream(new RawPublicAndExternalNoticeStream(),
                                                    'publicAndExternal'),
                            $profile);
    }
}

class RawPublicAndExternalNoticeStream extends NoticeStream
{
    function getNoticeIds($offset, $limit, $since_id, $max_id)
    {

        $notice = new Notice();

        $notice->selectAdd();
        $notice->selectAdd('id');

        $notice->orderBy('id DESC');

        if (!is_null($offset)) {
            $notice->limit($offset, $limit);
        }


		$notice->whereAdd('is_local !='. Notice::LOCAL_NONPUBLIC);
		$notice->whereAdd('is_local !='. Notice::GATEWAY);
		$notice->whereAdd('repeat_of IS NULL');

        // don't show sandboxed users in public timelines, unless you are a mod
        $hide_sandboxed = true;
        $cur_profile = Profile::current();
        if($cur_profile instanceof Profile) {
        	if($cur_profile->hasRight(Right::REVIEWSPAM)) {
        		$hide_sandboxed = false;
        	}
        }
        if($hide_sandboxed) {
        	$notice->whereAdd('profile_id NOT IN (SELECT profile_id FROM profile_role WHERE role =\''.Profile_role::SANDBOXED.'\')');
        }

        if(!empty($max_id) && is_numeric($max_id)) {
            $notice->whereAdd('id < '.$max_id);
        }

        if(!empty($since_id) && is_numeric($since_id)) {
            $notice->whereAdd('id > '.$since_id);
        }

        $ids = array();

        if ($notice->find()) {
            while ($notice->fetch()) {
                $ids[] = $notice->id;
            }
        }

        $notice->free();
        $notice = NULL;

        return $ids;
    }
}
