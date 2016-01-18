
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
  ·   Contact h@nnesmannerhe.im if you have any questions.                      ·
  ·                                                                             ·
  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · */


/* ·
   ·
   ·   Qvitter link in default GNU Social UI, toggle setting in api and reload page when finished
   ·
   · · · · · · · · · · · · · */


if(qvitterEnabled) {
	$('#site_nav_global_primary').find('.nav').first().prepend('<li id="toggleqvitter" title="' + toggleText + '"><a href="' + qvitterAllLink + '">' + toggleText + '</a></li>');
	}
else {
	$('#site_nav_global_primary').find('.nav').first().prepend('<li id="toggleqvitter" title="' + toggleText + '"><a href="' + location.href + '">' + toggleText + '</a></li>');

	$('#toggleqvitter > a').click(function(e){
		e.preventDefault();
		$.get(toggleQvitterAPIURL,function(data){
			if(data.success === true) {
				window.location.href = qvitterAllLink;
				}
			});

		});
	}
