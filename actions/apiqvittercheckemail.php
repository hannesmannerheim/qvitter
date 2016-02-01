<?php

/**
 * StatusNet, the distributed open-source microblogging tool
 *
 * Check email
 *
 * Returns 1 if email is already in use on this instance, 0 if not. Error if site is private.
 *
 * PHP version 5
 *
 * LICENCE: This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @category  API
 * @package   GNUsocial
 * @author    Hannes Mannerheim <h@nnesmannerhe.im>
 * @license   http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License version 3.0
 * @link      http://www.gnu.org/software/social/
 */

if (!defined('GNUSOCIAL')) { exit(1); }

class ApiQvitterCheckEmailAction extends ApiAction
{
    var $email = null;

    protected function prepare(array $args=array())
    {
        parent::prepare($args);

        $this->format = 'json';

        $this->email = $this->trimmed('email');

        if(!Validate::email($this->email, common_config('email', 'check_domain'))) {
            $this->clientError('Not a valid email address.', 400);
        }

        if (common_config('site', 'private')) {
            $this->clientError(_('This site is private.'), 403);
        }

        return true;
    }

    protected function handle()
    {
        parent::handle();

        if($this->emailExists($this->email)) {
            $email_exists = 1;
        } else {
            $email_exists = 0;
        }

        $this->initDocument('json');
        $this->showJsonObjects($email_exists);
        $this->endDocument('json');
    }

    /**
     * Does the given email address already exist?
     *
     * Checks a canonical email address against the database.
     *
     * @param string $email email address to check
     *
     * @return boolean true if the address already exists
     */
    function emailExists($email)
    {
        $user = User::getKV('email', $email);
        return is_object($user);
    }
}
