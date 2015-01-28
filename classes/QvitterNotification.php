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


}
