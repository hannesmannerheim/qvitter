<?php
/**
 * Table Definition for qvitternotification
 */

class QvitterNotification extends Managed_DataObject
{
    public $__table = 'qvitternotification';  // table name
    public $id;                              // int(4)  primary_key not_null
    public $to_profile_id;                   // int(4)
    public $from_profile_id;                 // int(4)
    public $ntype;                           // varchar(7)
    public $notice_id;                       // int(4)
    public $is_seen;                         // int(tiny)
    public $created;                         // datetime  multiple_key not_null

    public static function schemaDef()
    {
        return array(
            'fields' => array(
                'id' => array('type' => 'serial', 'not null' => true),
                'to_profile_id' => array('type' => 'int', 'description' => 'the profile being notified'),
                'from_profile_id' => array('type' => 'int', 'description' => 'the profile that is notifying'),                
                'ntype' => array('type' => 'varchar', 'length' => 7, 'description' => 'reply, like, mention or follow'),
                'notice_id' => array('type' => 'int', 'description' => 'id for the reply or mention or notice being faved'),
                'is_seen' => array('type' => 'int', 'size' => 'tiny', 'default' => 0, 'description' => 'if the notification has been seen'),                
                'created' => array('type' => 'datetime', 'not null' => true, 'description' => 'date this record was created')
            ),
            'primary key' => array('id'),
            'foreign keys' => array(
                'qvitternotification_to_profile_id_fkey' => array('profile', array('to_profile_id' => 'id')),
                'qvitternotification_from_profile_id_fkey' => array('profile', array('from_profile_id' => 'id')),
                'qvitternotification_notice_id_fkey' => array('notice', array('notice_id' => 'id')),
            ),
            'indexes' => array(
                'qvitternotification_created_idx' => array('created'),
                'qvitternotification_to_profile_id_idx' => array('to_profile_id'),
                'qvitternotification_from_profile_id_idx' => array('from_profile_id'),
            ),
        );
    }    
	
    /**
     * Wrapper for record insertion to update related caches
     */
    function insert()
    {
        $result = parent::insert();

        if ($result) {
            self::blow('qvitternotification:stream:%d', $this->to_profile_id);
        }

        return $result;
    }

    /**
     * Look up the creation timestamp for a given notice ID, even
     * if it's been deleted.
     *
     * @param int $id
     * @return mixed string recorded creation timestamp, or false if can't be found
     */
    public static function getAsTimestamp($id)
    {
        if (!$id) {
            return false;
        }

        $notice = QvitterNotification::getKV('id', $id);
        if ($notice) {
            return $notice->created;
        }

        return false;
    }

    /**
     * Build an SQL 'where' fragment for timestamp-based sorting from a since_id
     * parameter, matching notices posted after the given one (exclusive).
     *
     * If the referenced notice can't be found, will return false.
     *
     * @param int $id
     * @param string $idField
     * @param string $createdField
     * @return mixed string or false if no match
     */
    public static function whereSinceId($id, $idField='id', $createdField='created')
    {
        $since = QvitterNotification::getAsTimestamp($id);
        if ($since) {
            return sprintf("($createdField = '%s' and $idField > %d) or ($createdField > '%s')", $since, $id, $since);
        }
        return false;
    }

    /**
     * Build an SQL 'where' fragment for timestamp-based sorting from a since_id
     * parameter, matching notices posted after the given one (exclusive), and
     * if necessary add it to the data object's query.
     *
     * @param DB_DataObject $obj
     * @param int $id
     * @param string $idField
     * @param string $createdField
     * @return mixed string or false if no match
     */
    public static function addWhereSinceId(DB_DataObject $obj, $id, $idField='id', $createdField='created')
    {
        $since = self::whereSinceId($id, $idField, $createdField);
        if ($since) {
            $obj->whereAdd($since);
        }
    }

    /**
     * Build an SQL 'where' fragment for timestamp-based sorting from a max_id
     * parameter, matching notices posted before the given one (inclusive).
     *
     * If the referenced notice can't be found, will return false.
     *
     * @param int $id
     * @param string $idField
     * @param string $createdField
     * @return mixed string or false if no match
     */
    public static function whereMaxId($id, $idField='id', $createdField='created')
    {
        $max = QvitterNotification::getAsTimestamp($id);
        if ($max) {
            return sprintf("($createdField < '%s') or ($createdField = '%s' and $idField <= %d)", $max, $max, $id);
        }
        return false;
    }

    /**
     * Build an SQL 'where' fragment for timestamp-based sorting from a max_id
     * parameter, matching notices posted before the given one (inclusive), and
     * if necessary add it to the data object's query.
     *
     * @param DB_DataObject $obj
     * @param int $id
     * @param string $idField
     * @param string $createdField
     * @return mixed string or false if no match
     */
    public static function addWhereMaxId(DB_DataObject $obj, $id, $idField='id', $createdField='created')
    {
        $max = self::whereMaxId($id, $idField, $createdField);
        if ($max) {
            $obj->whereAdd($max);
        }
    }

}
