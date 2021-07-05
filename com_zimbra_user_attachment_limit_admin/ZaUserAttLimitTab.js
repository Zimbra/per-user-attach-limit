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
ZaUserAttLimitTab = function(parent, entry) {
    if (arguments.length == 0) return;
    ZaTabView.call(this, parent,"ZaUserAttLimitTab");
    ZaTabView.call(this, {
        parent:parent,
        iKeyName:"ZaUserAttLimitTab",
        contextId:"USER_ATT_LIMIT"
    });
    this.setScrollStyle(Dwt.SCROLL);

    document.getElementById('ztab__USER_ATT_LIMIT').innerHTML = '<div style="padding-left:10px"><h1>User Attachment Limit</h1>' +
    'Here you can set a per-user attachment size limit in kB.<br><br>Set the attachment limit on account <input type="text" id="UserAttLimit-account" list="UserAttLimit-datalist" onclick="this.value=\'\'" onchange="ZaUserAttLimitTab.prototype.setLimitField()" placeholder="user@domain.com">&nbsp;<span id="UserAttLimit-withfrom">to</span>:&nbsp;<input type="number" id="UserAttLimit-limit" placeholder="0"><datalist id="UserAttLimit-datalist"></datalist>&nbsp;&nbsp;<button id="UserAttLimit-btnLimitSave">OK</button>&nbsp;<button id="UserAttLimit-btnLimitApply">Apply on server</button>' +
    '<br><br><hr>' +
    '<h2>Status</h2><div id="UserAttLimit-status" style="color:#aaaaaa; font-style: italic;"></div></div>';   


     var request = new XMLHttpRequest();
     var url = '/service/extension/perUserAttachmentLimit';
     request.open('GET', url);
     request.onreadystatechange = function (e) {
         if (request.readyState == 4) {
             if (request.status == 200) {
                 window.userAttachmentAccountLimit = JSON.parse(request.responseText);
                 ZaUserAttLimitTab.prototype.getAccountsCallback(JSON.parse(request.responseText));
             }
             else {
                 alert('Failed to do this request.');
             }
         }
     }.bind(this);
     request.send();

    
    ZaUserAttLimitTab.prototype.status('Loading configuration, please wait...');
    
    var btnLimitSave = document.getElementById('UserAttLimit-btnLimitSave');
    btnLimitSave.onclick = AjxCallback.simpleClosure(this.save);

    var btnLimitApply = document.getElementById('UserAttLimit-btnLimitApply');
    btnLimitApply.onclick = AjxCallback.simpleClosure(this.apply);
}


ZaUserAttLimitTab.prototype = new ZaTabView();
ZaUserAttLimitTab.prototype.constructor = ZaUserAttLimitTab;

ZaUserAttLimitTab.prototype.getTabIcon =
    function () {
        return "ClientUpload" ;
    }

ZaUserAttLimitTab.prototype.getTabTitle =
    function () {
        return "User Attachment Limit";
    }

ZaUserAttLimitTab.prototype.setLimitField = function () {
   try {
      document.getElementById('UserAttLimit-limit').value = window.userAttachmentAccountLimit[document.getElementById('UserAttLimit-account').value].limit;
   } catch (err)
   {}
}

ZaUserAttLimitTab.prototype.getAccountsCallback = function (result) {
   const dataList = document.getElementById('UserAttLimit-datalist');
   dataList.innerHTML = "";
   Object.keys(result).forEach(function(key) {
      var option = document.createElement('option');
      option.value = key;
      dataList.appendChild(option);
   });

   //now sort the thing... 
   var options = document.getElementById('UserAttLimit-datalist').options;
   var optionsArray = [];
   for (var i = 0; i < options.length; i++) {
       optionsArray.push(options[i]);
   }
   optionsArray = optionsArray.sort(function (a, b) {           
       return a.value.charCodeAt(0) - b.value.charCodeAt(0);    
   });
    
   dataList.innerHTML = "";
   for (var i = 0; i < optionsArray.length; i++) {            
     var option = document.createElement('option');
     option.value = optionsArray[i].value;
     dataList.appendChild(option);
   }

   ZaUserAttLimitTab.prototype.status('Ready.');
   return;
}

ZaUserAttLimitTab.prototype.status = function (statusText) {
   document.getElementById('UserAttLimit-status').innerHTML = statusText;
}

ZaUserAttLimitTab.prototype.save = function () {
   if(!document.getElementById('UserAttLimit-account').value == "")
   {
      window.userAttachmentAccountLimit[document.getElementById('UserAttLimit-account').value].limit = document.getElementById('UserAttLimit-limit').value;
   }   
}

ZaUserAttLimitTab.prototype.apply = function () {
   ZaUserAttLimitTab.prototype.save();
   ZaUserAttLimitTab.prototype.status('Please wait while configuration is applied...')
   var request = new XMLHttpRequest();
   var url = '/service/extension/perUserAttachmentLimit';
   var formData = new FormData();
   formData.append("jsondata", JSON.stringify(window.userAttachmentAccountLimit));
   request.open('POST', url);
   request.onreadystatechange = function (e) {
      if (request.readyState == 4) {
          if (request.status == 200) {
                 window.userAttachmentAccountLimit = JSON.parse(request.responseText);
                 ZaUserAttLimitTab.prototype.getAccountsCallback(JSON.parse(request.responseText));
          }
          else {
              alert('Failed to do this request.');
          }
      }
   }.bind(this);
   request.send(formData);
}

