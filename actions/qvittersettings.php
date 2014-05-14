<?php
 
 /* · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·  
  ·                                                                             ·
  ·                                                                             ·
  ·                             Q V I T T E R                                   ·
  ·                                                                             ·
  ·              http://github.com/hannesmannerheim/qvitter                     ·
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
        return _m('Enable or disable Qvitter UI');
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
				$prefs = Profile_prefs::getData($user->getProfile(), 'qvitter', 'disable_qvitter');
			} catch (NoResultException $e) {
				$prefs = false;
			}
		} else {
			try {
				$prefs = Profile_prefs::getData($user->getProfile(), 'qvitter', 'enable_qvitter');
			} catch (NoResultException $e) {
				$prefs = false;
			}			
		}	

        $form = new QvitterPrefsForm($this, $prefs);

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

        // TRANS: Confirmation shown when user profile settings are saved.
        $this->showForm(_('Settings saved.'), true);

        return;
    }
}

class QvitterPrefsForm extends Form
{
    var $prefs;

    function __construct($out, $prefs)
    {
        parent::__construct($out);
        $this->prefs = $prefs;
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
                        (!empty($this->prefs)));
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
