/*
Copyright (C) 2014-2021  Barry de Graaff

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
 */
if(appNewUI && ZaSettings){
    if(window.console && window.console.log) console.log("Start loading com_zimbra_user_attachment_limit_admin.js");
    function ZaUserAttLimit() {
        ZaItem.call(this,"ZaUserAttLimit");
        this._init();
        this.type = "ZaUserAttLimit";
    };
    ZaUserAttLimit.prototype = new ZaItem;
    ZaUserAttLimit.prototype.constructor = ZaUserAttLimit;

    ZaZimbraAdmin._USER_ATT_LIMIT_VIEW = ZaZimbraAdmin.VIEW_INDEX++;

    ZaApp.prototype.getUserAttLimitViewController =
        function() {
            if (this._controllers[ZaZimbraAdmin._USER_ATT_LIMIT_VIEW] == null)
                this._controllers[ZaZimbraAdmin._USER_ATT_LIMIT_VIEW] = new ZaUserAttLimitController(this._appCtxt, this._container);
            return this._controllers[ZaZimbraAdmin._USER_ATT_LIMIT_VIEW];
        }

    ZaUserAttLimit.TreeListener = function (ev) {
        var userAttLimit = new ZaUserAttLimit();

        if(ZaApp.getInstance().getCurrentController()) {
            ZaApp.getInstance().getCurrentController().switchToNextView(ZaApp.getInstance().getUserAttLimitViewController(),ZaUserAttLimitController.prototype.show, [userAttLimit]);
        } else {
            ZaApp.getInstance().getUserAttLimitViewController().show(userAttLimit);
        }
    }

    ZaUserAttLimit.TreeModifier = function (tree) {
        var overviewPanelController = this ;
        if (!overviewPanelController) throw new Exception("ZaUserAttLimit.TreeModifier: Overview Panel Controller is not set.");
        if(ZaSettings.ENABLED_UI_COMPONENTS[ZaSettings.Client_UPLOAD_VIEW] || ZaSettings.ENABLED_UI_COMPONENTS[ZaSettings.CARTE_BLANCHE_UI]) {
            var parentPath = ZaTree.getPathByArray([ZaMsg.OVP_home, ZaMsg.OVP_toolMig]);

            var ti = new ZaTreeItemData({
                parent:parentPath,
                id:ZaId.getTreeItemId(ZaId.PANEL_APP,"magHV",null, "UserAttLimitHV"),
                text: "User Attachment Limit",
                mappingId: ZaZimbraAdmin._USER_ATT_LIMIT_VIEW});
            tree.addTreeItemData(ti);

            if(ZaOverviewPanelController.overviewTreeListeners) {
                ZaOverviewPanelController.overviewTreeListeners[ZaZimbraAdmin._USER_ATT_LIMIT_VIEW] = ZaUserAttLimit.TreeListener;
            }
        }
    }

    if(ZaOverviewPanelController.treeModifiers)
        ZaOverviewPanelController.treeModifiers.push(ZaUserAttLimit.TreeModifier);

}

