<?php

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   ·                                                                            ·
   ·  Extends GNU social's Profile_block class with useful functions            ·
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

class QvitterBlocked extends Profile_block
{

    const CACHE_WINDOW = 201;

    public static function getBlocked($profile_id, $offset = 0, $limit = PROFILES_PER_PAGE)
    {
        $ids = self::getBlockedIDs($profile_id, $offset, $limit);
        try {
        $blocked = Profile_block::listFind('blocked', $ids);
            return $blocked;
        } catch(NoResultException $e) {
            return false;
        }
    }


    public static function getBlockedIDs($profile_id, $offset, $limit)
    {
        $cacheKey = 'qvitterblocked:'.$profile_id;

        $queryoffset = $offset;
        $querylimit = $limit;

        if ($offset + $limit <= self::CACHE_WINDOW) {
            // Oh, it seems it should be cached
            $ids = self::cacheGet($cacheKey);
            if (is_array($ids)) {
                return array_slice($ids, $offset, $limit);
            }
            // Being here indicates we didn't find anything cached
            // so we'll have to fill it up simultaneously
            $queryoffset = 0;
            $querylimit  = self::CACHE_WINDOW;
        }

        $blocks = new Profile_block();
        $blocks->blocker = $profile_id;
        $blocks->selectAdd('blocked');
        $blocks->whereAdd("blocked != {$profile_id}");
        $blocks->orderBy('modified DESC');
        $blocks->limit($queryoffset, $querylimit);

        if (!$blocks->find()) {
            return array();
        }

        $ids = $blocks->fetchAll('blocked');

        // If we're simultaneously filling up cache, remember to slice
        if ($queryoffset === 0 && $querylimit === self::CACHE_WINDOW) {
            self::cacheSet($cacheKey, $ids);
            return array_slice($ids, $offset, $limit);
        }

        return $ids;
    }

    /**
     * Flush cached blocks when blocks are updated
     *
     * @param mixed $dataObject Original version of object
     *
     * @return boolean success flag.
     */
    function update($dataObject=false)
    {
        self::blow('qvitterblocked:'.$this->blocker);
        self::blow('qvitterblocked:'.$this->blocked);

        return parent::update($dataObject);
    }

}
