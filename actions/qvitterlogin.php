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

if (!defined('GNUSOCIAL')) { exit(1); }

class QvitterLoginAction extends FormAction
{
    protected $needLogin = false;

    /**
     * Prepare page to run
     *
     *
     * @param $args
     * @return string title
     */
    protected function prepare(array $args=array())
    {
        // @todo this check should really be in index.php for all sensitive actions
        $ssl = common_config('site', 'ssl');
        if (empty($_SERVER['HTTPS']) && ($ssl == 'always' || $ssl == 'sometimes')) {
            common_redirect(common_local_url('login'));
        }

        return parent::prepare($args);
    }

    /**
     * Handle input, produce output
     *
     * Switches on request method; either shows the form or handles its input.
     *
     * @return void
     */
    protected function handle()
    {
        if (common_is_real_login()) {
            common_redirect(common_local_url('all', array('nickname' => $this->scoped->nickname)), 307);
        }

        return parent::handle();
    }

    /**
     * Check the login data
     *
     * Determines if the login data is valid. If so, logs the user
     * in, and redirects to the 'with friends' page, or to the stored
     * return-to URL.
     *
     * @return void
     */
    protected function handlePost()
    {
        parent::handlePost();

        // XXX: login throttle

        $nickname = $this->trimmed('nickname');
        $password = $this->arg('password');

        $user = common_check_user($nickname, $password);

        if (!$user instanceof User) {
            // TRANS: Form validation error displayed when trying to log in with incorrect credentials.
            throw new ServerException(_('Incorrect username or password.'));
        }

        // success!
        if (!common_set_user($user)) {
            // TRANS: Server error displayed when during login a server error occurs.
            throw new ServerException(_('Error setting user. You are probably not authorized.'));
        }

        common_real_login(true);
        $this->updateScopedProfile();

        if ($this->boolean('rememberme')) {
            common_rememberme($user);
        }

        $url = common_get_returnto();

        if ($url) {
            // We don't have to return to it again
            common_set_returnto(null);
            $url = common_inject_session($url);
        } else {
            $url = common_local_url('all',
                                    array('nickname' => $this->scoped->nickname));
        }

        common_redirect($url, 303);
    }


    function showPage()
    {

		QvitterAction::showQvitter();

    }

}
