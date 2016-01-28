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

if (!defined('STATUSNET') && !defined('LACONICA')) {
    exit(1);
}


class QvitterAdminSettingsAction extends AdminPanelAction
{
    /**
     * Returns the page title
     *
     * @return string page title
     */
    function title()
    {
        // TRANS: Page title for site-wide notice tab in admin panel.
        return _('Qvitter Sidebar Notice');
    }

    /**
     * Instructions for using this form.
     *
     * @return string instructions
     */
    function getInstructions()
    {
        // TRANS: Instructions for site-wide notice tab in admin panel.
        return _('Edit notice in Qvitter\'s sidebar');
    }

    /**
     * Show the site notice admin panel form
     *
     * @return void
     */
    function showForm()
    {
        $form = new QvitterNoticeAdminPanelForm($this);
        $form->show();
        return;
    }

    /**
     * Save settings from the form
     *
     * @return void
     */
    function saveSettings()
    {
        $qvitterNotice = $this->trimmed('qvitter-notice');
        $qvitterNoticeLoggedOut = $this->trimmed('qvitter-notice-logged-out');

        // assert(all values are valid);
        // This throws an exception on validation errors

        $this->validate($qvitterNotice);
        $this->validate($qvitterNoticeLoggedOut);

        $config = new Config();

        $result = Config::save('site', 'qvitternotice', $qvitterNotice);
        $result = Config::save('site', 'qvitternoticeloggedout', $qvitterNoticeLoggedOut);


        if (!$result) {
            // TRANS: Server error displayed when saving a sidebar notice was impossible.
            $this->ServerError(_('Unable to save qvitter sidebar notice.'));
        }
    }

    function validate(&$qvitterNotice)
    {
        // Validate notice text

	//The column 'value' in table 'config' is TEXT
        if (mb_strlen($qvitterNotice) > 21844)  {
            $this->clientError(
                // TRANS: Client error displayed when a sidebar notice was longer than allowed.
                _('Maximum length for the sidebar notice is 21844 characters.')
            );
        }
    }
}

class QvitterNoticeAdminPanelForm extends AdminForm
{
    /**
     * ID of the form
     *
     * @return int ID of the form
     */

    function id()
    {
        return 'form_qvitter_notice_admin_panel';
    }

    /**
     * class of the form
     *
     * @return string class of the form
     */

    function formClass()
    {
        return 'form_settings';
    }

    /**
     * Action of the form
     *
     * @return string URL of the action
     */

    function action()
    {
        return common_local_url('qvitteradminsettings');
    }

    /**
     * Data elements of the form
     *
     * @return void
     */

    function formData()
    {
        $this->out->elementStart('ul', 'form_data');

        $this->out->elementStart('li');
        $this->out->textarea(
            'qvitter-notice',
            // TRANS: Label for sidebar notice text field in admin panel.
            _('Qvitter sidebar notice text'),
            common_config('site', 'qvitternotice'),
            // TRANS: Tooltip for sidebar notice text field in admin panel.
            _('Qvitter\'s sidebar notice text (21,844 characters maximum; HTML allowed)')
        );
        $this->out->elementEnd('li');

        $this->out->elementEnd('ul');

        $this->out->elementStart('ul', 'form_data');

        $this->out->elementStart('li');
        $this->out->textarea(
            'qvitter-notice-logged-out',
            // TRANS: Label for sidebar notice text field in admin panel.
            _('Qvitter sidebar notice text (logged out)'),
            common_config('site', 'qvitternoticeloggedout'),
            // TRANS: Tooltip for sidebar notice text field in admin panel.
            _('Qvitter\'s sidebar notice text, when logged out (21,844 characters maximum; HTML allowed)')
        );
        $this->out->elementEnd('li');

        $this->out->elementEnd('ul');
    }

    /**
     * Action elements
     *
     * @return void
     */

    function formActions()
    {
        $this->out->submit(
            'submit',
            // TRANS: Button text for saving sidebar notice in admin panel.
            _m('BUTTON','Save'),
            'submit',
            null,
            // TRANS: Button title to save sidebar notice in admin panel.
            _('Save sidebar notice.')
        );
    }
}
