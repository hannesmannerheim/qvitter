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

class QvitterSettingsAction extends SettingsAction
{
    /**
     * Title of the page
     *
     * @return string Page title
     */
    function title()
    {
        // TRANS: Page title.
        return _m('Qvitter settings');
    }

    /**
     * Instructions for use
     *
     * @return string Instructions for use
     */

    function getInstructions()
    {
        // TRANS: Page instructions.
        return _m('Qvitter Settings');
    }

    /**
     * Show the form for Qvitter
     *
     * @return void
     */
    function showContent()
    {
        $user = common_current_user();

		if(QvitterPlugin::settings('enabledbydefault')) {
			try {
				$disable_enable_prefs = Profile_prefs::getData($user->getProfile(), 'qvitter', 'disable_qvitter');
			} catch (NoResultException $e) {
				$disable_enable_prefs = false;
			}
		} else {
			try {
				$disable_enable_prefs = Profile_prefs::getData($user->getProfile(), 'qvitter', 'enable_qvitter');
			} catch (NoResultException $e) {
				$disable_enable_prefs = false;
			}
		}


		try {
			$hide_replies_prefs = Profile_prefs::getData($user->getProfile(), 'qvitter', 'hide_replies');
		} catch (NoResultException $e) {
			$hide_replies_prefs = false;
		}

		try {
			$disable_keyboard_shortcuts = Profile_prefs::getData($user->getProfile(), 'qvitter', 'disable_keyboard_shortcuts');
		} catch (NoResultException $e) {
			$disable_keyboard_shortcuts = false;
		}

        $form = new QvitterPrefsForm($this, $disable_enable_prefs, $hide_replies_prefs, $disable_keyboard_shortcuts);

        $form->show();
    }

    /**
     * Handler method
     *
     * @param array $argarray is ignored since it's now passed in in prepare()
     *
     * @return void
     */

    function handlePost()
    {
        $user = common_current_user();

		if(QvitterPlugin::settings('enabledbydefault')) {
			Profile_prefs::setData($user->getProfile(), 'qvitter', 'disable_qvitter', $this->boolean('disable_qvitter'));
			}
		else {
			Profile_prefs::setData($user->getProfile(), 'qvitter', 'enable_qvitter', $this->boolean('enable_qvitter'));
			}

        Profile_prefs::setData($user->getProfile(), 'qvitter', 'hide_replies', $this->boolean('hide_replies'));

        Profile_prefs::setData($user->getProfile(), 'qvitter', 'disable_keyboard_shortcuts', $this->boolean('disable_keyboard_shortcuts'));

        // TRANS: Confirmation shown when user profile settings are saved.
        $this->showForm(_('Settings saved.'), true);

        return;
    }
}

class QvitterPrefsForm extends Form
{
    var $disable_enable_prefs;
    var $hide_replies_prefs;
    var $disable_keyboard_shortcuts;

    function __construct($out, $disable_enable_prefs, $hide_replies_prefs, $disable_keyboard_shortcuts)
    {
        parent::__construct($out);
        $this->disable_enable_prefs = $disable_enable_prefs;
        $this->hide_replies_prefs = $hide_replies_prefs;
        $this->disable_keyboard_shortcuts = $disable_keyboard_shortcuts;
    }

    /**
     * Visible or invisible data elements
     *
     * Display the form fields that make up the data of the form.
     * Sub-classes should overload this to show their data.
     *
     * @return void
     */

    function formData()
    {

		if(QvitterPlugin::settings('enabledbydefault')) {
			$enabledisable = 'disable_qvitter';
			$enabledisablelabel = _('Disable Qvitter');
		} else {
			$enabledisable = 'enable_qvitter';
			$enabledisablelabel = _('Enable Qvitter');
		}

        $this->elementStart('fieldset');
        $this->elementStart('ul', 'form_data');
        $this->elementStart('li');
        $this->checkbox($enabledisable,
                        $enabledisablelabel,
                        (!empty($this->disable_enable_prefs)));
        $this->elementEnd('li');
        $this->elementEnd('ul');
        $this->elementEnd('fieldset');

        $this->elementStart('fieldset');
        $this->elementStart('ul', 'form_data');
        $this->elementStart('li');
        $this->checkbox('hide_replies',
                        _('Hide replies to people I\'m not following'),
                        (!empty($this->hide_replies_prefs)));
        $this->elementEnd('li');
        $this->elementEnd('ul');
        $this->elementEnd('fieldset');

        $this->elementStart('fieldset');
        $this->elementStart('ul', 'form_data');
        $this->elementStart('li');
        $this->checkbox('disable_keyboard_shortcuts',
                        _('Disable keyboard shortcuts'),
                        (!empty($this->disable_keyboard_shortcuts)));
        $this->elementEnd('li');
        $this->elementEnd('ul');
        $this->elementEnd('fieldset');
    }

    /**
     * Buttons for form actions
     *
     * Submit and cancel buttons (or whatever)
     * Sub-classes should overload this to show their own buttons.
     *
     * @return void
     */

    function formActions()
    {
        $this->submit('submit', _('Save'));
    }

    /**
     * ID of the form
     *
     * Should be unique on the page. Sub-classes should overload this
     * to show their own IDs.
     *
     * @return int ID of the form
     */

    function id()
    {
        return 'form_qvitter_prefs';
    }

    /**
     * Action of the form.
     *
     * URL to post to. Should be overloaded by subclasses to give
     * somewhere to post to.
     *
     * @return string URL to post to
     */

    function action()
    {
        return common_local_url('qvittersettings');
    }

    /**
     * Class of the form. May include space-separated list of multiple classes.
     *
     * @return string the form's class
     */

    function formClass()
    {
        return 'form_settings';
    }
}
