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

ZaUserAttLimitController = function(appCtxt, container) {
    ZaXFormViewController.call(this, appCtxt, container, "ZaUserAttLimitController");
    this._UICreated = false;
    this.tabConstructor = ZaUserAttLimitTab;
    this._appbarOperation = ''; //remove save, close and help buttons
}

ZaUserAttLimitController.prototype = new ZaXFormViewController();
ZaUserAttLimitController.prototype.constructor = ZaUserAttLimitController;

ZaController.setViewMethods["ZaUserAttLimitController"] = [];

ZaUserAttLimitController.setViewMethod = function (item) {
    if(!this._UICreated) {
        this._contentView = this._view = new this.tabConstructor(this._container,item);
        var elements = new Object();
        elements[ZaAppViewMgr.C_APP_CONTENT] = this._view;
        ZaApp.getInstance().getAppViewMgr().createView(this.getContentViewId(), elements);
        this._UICreated = true;
        ZaApp.getInstance()._controllers[this.getContentViewId ()] = this ;
    }
    ZaApp.getInstance().pushView(this.getContentViewId());

}
ZaController.setViewMethods["ZaUserAttLimitController"].push(ZaUserAttLimitController.setViewMethod) ;
