'use strict';
/* extra-player-info.js
 * Add extra information for players in players page
 * @author convincedd, ryanli
 */

Foxtrick.modules['ExtraPlayerInfo'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['allPlayers'],
	OPTIONS: ['CoachInfo', 'Flag', 'Language'],

	run: function(doc) {
		// used for coloring NT players when AddFlags is enabled
		var ntColor = '#ffcc00';
		var module = this;

		Foxtrick.Pages.Players.getPlayerList(doc,
		  function(playerList) {
			if (!playerList || !playerList.length) {
				Foxtrick.log('ExtraPlayerInfo: unable to retrieve player list.');
			}

			var lang = Foxtrick.Prefs.getString('htLanguage');
			var allPlayers = doc.getElementsByClassName('playerInfo');
			for (var i = 0; i < allPlayers.length; ++i) {
				var id = Foxtrick.Pages.Players.getPlayerId(allPlayers[i]);
				var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);
				if (!player)
					return;

				var basics = allPlayers[i].getElementsByTagName('p')[0];

				if (Foxtrick.Prefs.isModuleOptionEnabled('ExtraPlayerInfo', 'CoachInfo')
					&& player.trainerData !== undefined) {
					var trainerSkillStr = Foxtrick.L10n
						.getLevelByTypeAndValue('levels', player.trainerData.skill);
					var trainerTypeStr = '';
					if (player.trainerData.type == 0) {
						trainerTypeStr = Foxtrick.L10n.getString('ExtraPlayerInfo.defensiveTrainer');
					}
					else if (player.trainerData.type == 1) {
						trainerTypeStr = Foxtrick.L10n.getString('ExtraPlayerInfo.offensiveTrainer');
					}
					else {
						trainerTypeStr = Foxtrick.L10n.getString('ExtraPlayerInfo.balancedTrainer');
					}
					trainerTypeStr = trainerTypeStr.split('%s');

					var trainerSkillLink = doc.createElement('a');
					trainerSkillLink.href = '/Help/Rules/AppDenominations.aspx?lt=skill&ll=' +
						player.trainerData.skill + '#skill';
					trainerSkillLink.className = 'skill';
					trainerSkillLink.textContent = trainerSkillStr;

					var div = Foxtrick.createFeaturedElement(doc, module, 'div');
					div.appendChild(doc.createTextNode(trainerTypeStr[0]));
					div.appendChild(trainerSkillLink);
					div.appendChild(doc.createTextNode(trainerTypeStr[1]));

					// insert after the second break
					basics.appendChild(div);
				}
				if (Foxtrick.Prefs.isModuleOptionEnabled('ExtraPlayerInfo', 'Flag')
					&& player.countryId !== undefined) {
					var links = allPlayers[i].getElementsByTagName('a');
					var isNtPlayer = (links[0].href.search(/NationalTeam/i) != -1);
					var nameLink = isNtPlayer ? links[1] : links[0];
					if (!isNtPlayer) {
						// NT players have flags by default, so only need
						// to add flags for non-NT players
						var flag = Foxtrick.util.id.createFlagFromCountryId(doc, player.countryId);
						if (flag) {
							Foxtrick.makeFeaturedElement(flag, module);
							nameLink.parentNode.insertBefore(flag, nameLink.parentNode.firstChild);
						}
					}
					else {
						var style = 'background-color: ' + ntColor + ';';
						nameLink.setAttribute('style', style);
					}
				}

				// experiment: add language
				if (Foxtrick.Prefs.isModuleOptionEnabled('ExtraPlayerInfo', 'Language') &&
				    Foxtrick.isPage(doc, 'ownPlayers')) {
					var addPlayerLanguage = function(playerid, node) {
						Foxtrick.Pages.Player.getPlayer(doc, playerid,
						  function(player) {
							if (!player)
								return;
							if (player.playerLanguage) {
								var language = Foxtrick.createFeaturedElement(doc, module, 'em');
								Foxtrick.addClass(language, 'shy');
								language.setAttribute('style',
								                      'font-weight:normal; margin-left:5px;');
								language.textContent = player.playerLanguage;
								if (player.PlayerLanguageID)
									language.setAttribute('PlayerLanguageID',
									                      player.playerLanguageID);
								node.appendChild(language);
							}
						});
					};
					var targetNode = allPlayers[i].getElementsByTagName('b')[0];
					if (targetNode)
						addPlayerLanguage(id, targetNode);
				}
			}
		});
	}
};
