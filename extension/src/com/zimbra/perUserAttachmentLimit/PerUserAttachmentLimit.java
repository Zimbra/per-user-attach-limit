/*

Copyright (C) 2016-2021  Barry de Graaff

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

package com.zimbra.perUserAttachmentLimit;

import com.zimbra.common.util.ZimbraLog;
import com.zimbra.cs.account.*;
import com.zimbra.cs.extension.ExtensionHttpHandler;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.zimbra.cs.servlet.util.AuthUtil;
import org.apache.commons.io.IOUtils;
import org.json.JSONException;
import org.json.JSONObject;


public class PerUserAttachmentLimit extends ExtensionHttpHandler {
    /**
     * The path under which the handler is registered for an extension.
     * return "/perUserAttachmentLimit" makes it show up under:
     * https://testserver.example.com/service/extension/perUserAttachmentLimit
     *
     * @return path
     */
    @Override
    public String getPath() {
        return "/perUserAttachmentLimit";
    }

    /**
     * Processes HTTP GET requests.
     *
     * @param req  request message
     * @param resp response message
     * @throws java.io.IOException
     * @throws javax.servlet.ServletException
     */
    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        try {
            //all authentication is done by AuthUtil.getAuthTokenFromHttpReq, returns null if unauthorized
            final AuthToken token = AuthUtil.getAuthTokenFromHttpReq(req, resp, true, true);
            if (token != null) {
                List<Account> zimbraAccts = null;

                Provisioning prov = Provisioning.getInstance();
                zimbraAccts = prov.getAllAccounts(null);
                JSONObject allAccountsJSON = new JSONObject();

                for (int i = 0; i < zimbraAccts.size(); i++) {
                    JSONObject item = new JSONObject();
                    item.put("limit", 0);
                    allAccountsJSON.put(zimbraAccts.get(i).getName(), item);
                }
                JSONObject responseJSON;
                //Try and read stored config from disk, upon failure, only return all-accounts response
                try {
                    JSONObject configFromDiskJSON = new JSONObject(Files.readString(Paths.get("/opt/zimbra/lib/ext/perUserAttachmentLimit/config.json"), StandardCharsets.UTF_8));
                    responseJSON = mergeJSONObjects(allAccountsJSON, configFromDiskJSON);
                } catch (Exception e) {
                    responseJSON = allAccountsJSON;
                }
                resp.getOutputStream().print(responseJSON.toString());
            }
        } catch (Exception e) {
            ZimbraLog.extensions.debug("Per User Attachment Limit Exception is:%s", e.toString());
        }
    }

    //Helper method to combine JSON objects
    public static JSONObject mergeJSONObjects(JSONObject json1, JSONObject json2) {
        JSONObject mergedJSON = new JSONObject();
        try {
            mergedJSON = new JSONObject(json1, JSONObject.getNames(json1));
            for (String crunchifyKey : JSONObject.getNames(json2)) {
                mergedJSON.put(crunchifyKey, json2.get(crunchifyKey));
            }

        } catch (JSONException e) {
            ZimbraLog.extensions.debug("Per User Attachment JSON merge Exception" + e.toString());
        }
        return mergedJSON;
    }

    /**
     * Processes HTTP POST requests.
     *
     * @param req  request message
     * @param resp response message
     * @throws java.io.IOException
     * @throws javax.servlet.ServletException
     */
    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        try {
            //all authentication is done by AuthUtil.getAuthTokenFromHttpReq, returns null if unauthorized
            final AuthToken token = AuthUtil.getAuthTokenFromHttpReq(req, resp, true, true);
            if (token != null) {
                //jsondata should be a valid json string, that we could just dump into the config.json, however as a form of validation, we parse the JSON data and then toString() it.
                //in case it fails, something went wrong, and the saving will not take place
                JSONObject receivedJSON = new JSONObject(IOUtils.toString(req.getPart("jsondata").getInputStream(), "UTF-8"));
                FileWriter file = new FileWriter("/opt/zimbra/lib/ext/perUserAttachmentLimit/config.json");
                file.write(receivedJSON.toString());
                file.flush();

                //write config file for postfix
                Integer ruleNO = 0;
                Iterator<String> keys = receivedJSON.keys();
                FileWriter fw = new FileWriter("/opt/zimbra/conf/postfwd.cf");
                fw.write("#do not make manual changes to this file, it is overwritten by perUserAttachmentLimit extension\r\n");
                while (keys.hasNext()) {
                    String key = keys.next();
                    if (receivedJSON.get(key) instanceof JSONObject) {
                        Integer limit = ((JSONObject) receivedJSON.get(key)).getInt("limit");
                        //only put in postfix config is limit > 0
                        if (limit > 0) {
                            fw.write("id=SZ" + String.format("%05d", ruleNO) + "; protocol_state=END-OF-MESSAGE; size>=" + (limit * 1024) + "; sender==" + key + "; action=REJECT HUGE FILE.\r\n");
                            ruleNO++;
                        }
                    }
                }
                fw.write("id=SZ99999; protocol_state=END-OF-MESSAGE; action=DUNNO\r\n");
                fw.flush();

                //finally reload postfwd...
                String postfwdResult = reloadPostFWD();
                ZimbraLog.extensions.info("Per User Attachment Limit postfwd command result is:%s", postfwdResult);

                //return it back to the client without changes
                resp.getOutputStream().print(receivedJSON.toString());
            }
        } catch (Exception e) {
            ZimbraLog.extensions.debug("Per User Attachment Limit Exception is:%s", e.toString());
        }
    }

    private String reloadPostFWD() {
        String cmdResult = "";
        try {
            ProcessBuilder pb = new ProcessBuilder()
                    .command("/usr/local/sbin/postfwd-reload", "--reload")
                    .redirectErrorStream(true);
            Process p = pb.start();

            BufferedReader cmdOutputBuffer = new BufferedReader(new InputStreamReader(p.getInputStream()));

            StringBuilder builder = new StringBuilder();
            String aux = "";
            while ((aux = cmdOutputBuffer.readLine()) != null) {
                builder.append(aux);
                builder.append(';');
            }
            cmdResult = builder.toString();
        } catch (
                Exception e) {
            ZimbraLog.extensions.debug("PerUserAttachmentLimit exception:%s", e.toString());
        }
        return cmdResult;
    }

}
