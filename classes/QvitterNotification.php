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
                'to_profile_id' => array('type' => 'int', 'not null'=>true, 'description' => 'the profile being notified'),
                'from_profile_id' => array('type' => 'int', 'not null'=>true, 'description' => 'the profile that is notifying'),
                'ntype' => array('type' => 'varchar', 'length' => 7, 'description' => 'reply, like, mention or follow'),
                'notice_id' => array('type' => 'int', 'description' => 'id for the reply or mention or notice being faved'),
                'is_seen' => array('type' => 'int', 'size' => 'tiny', 'default' => 0, 'description' => 'if the notification has been seen'),                
                'created' => array('type' => 'datetime', 'not null' => true, 'description' => 'date this record was created')
            ),
            'primary key' => array('id'),
            'foreign keys' => array(
                'qvitternotification_to_profile_id_fkey' => array('profile', array('to_profile_id' => 'id')),
                'qvitternotification_from_profile_id_fkey' => array('profile', array('from_profile_id' => 'id')),
                // removing this because there can be rows without related notice_id
                //'qvitternotification_notice_id_fkey' => array('notice', array('notice_id' => 'id')),
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

    static public function beforeSchemaUpdate()
    {
        $table = strtolower(get_called_class());
        $schema = Schema::get();
        try {
            $schemadef = $schema->getTableDef($table);
        } catch (SchemaTableMissingException $e) {
            printfnq("\nTable '$table' not created yet, so nothing to do with it before Schema Update... DONE.");
            return;
        }

        printfnq("\nEnsuring no NULL values for foreign keys in QvitterNotification...");
        // Because constraints to profile and notice table assume not null, we must
        // remove any values in these columns that are NULL (or 0), because they
        // are invalid anyway.
        $qn = new QvitterNotification();
        foreach (['to_profile_id', 'from_profile_id'] as $field) {
            $qn->whereAdd(sprintf('%s is NULL', $field), 'OR');
            $qn->whereAdd(sprintf('%s = 0', $field), 'OR');
        }
        if ($qn->find()) {
            printfnq(" removing {$qn->N} rows...");
            while ($qn->fetch()) {
                $qn->delete();
            }
        }
        printfnq("DONE.\n");

        printfnq("Ensuring no dead profile or notice IDs are stored in QvitterNotification...");
        // We could probably build a single statement for this but I just want it done...
        // or maybe be smart and take it directly from our defined 'foreign keys'... but oh well!
        $constraints = ['to_profile_id'     => 'profile:id',
                        'from_profile_id'   => 'profile:id'];
        foreach ($constraints as $field=>$foreign) {
            $qn = new QvitterNotification();
            $qn->selectAdd();
            $qn->selectAdd('qvitternotification.id');   // to avoid confusion with profile.id, also we only need the primary key
            $qn->joinAdd([$field, $foreign], 'LEFT');
            $qn->whereAdd(str_replace(':', '.', $foreign).' IS NULL');
            if ($qn->find()) {
                printfnq("\n{$field}: {$qn->N} rows...");
                while ($qn->fetch()) {
                    $qn->delete();
                }
            }
        }
        printfnq("DONE.\n");
    }
}
