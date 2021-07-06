# Per user attachment size limits

This repo holds the Admin Zimlet and extension that generate a postfix config file like this:

```
zimbra@zm-zimbra9:/root$ cat /opt/zimbra/conf/postfwd.cf
#do not make manual changes to this file, it is overwritten by perUserAttachmentLimit extension
id=SZ00000; protocol_state=END-OF-MESSAGE; size>=10240; sender==admin@zm-zimbra9.barrydegraaff.tk; action=REJECT HUGE FILE.
id=SZ00001; protocol_state=END-OF-MESSAGE; size>=10238976; sender==info@barrydegraaff.tk; action=REJECT HUGE FILE.
id=SZ00002; protocol_state=END-OF-MESSAGE; size>=113664; sender==nilam@barrytest.tk; action=REJECT HUGE FILE.
id=SZ00003; protocol_state=END-OF-MESSAGE; size>=9216000; sender==nilam2@barrytest.tk; action=REJECT HUGE FILE.
id=SZ99999; protocol_state=END-OF-MESSAGE; action=DUNNO
zimbra@zm-zimbra9:/root$ 
```

The Zimlet needs to be deployed with `zmzimletctl deploy com_zimbra_user_attachment_limit_admin.zip`.

The Extension needs to be placed like this:

```
zimbra@zm-zimbra9:/root$ ls -hal /opt/zimbra/lib/ext/perUserAttachmentLimit
total 20K
drwxr-xr-x  2 root   root   4.0K Jul  5 12:17 .
drwxrwxr-x 41 root   root   4.0K Jul  1 12:08 ..
-rw-r--r--  1 zimbra zimbra  729 Jul  5 12:18 config.json
-rw-r--r--  1 root   root   5.4K Jul  5 12:17 extension.jar
```

config.json can be an empty file, but Zimbra must have read/write permission to it.

Add a bash wrapper for reloading postfwd: 

```
cat  /usr/local/sbin/postfwd-reload
#!/bin/bash
/usr/sbin/postfwd --reload
```

## Screenshots

> ![](screenshots/per-user-admin-ui.png)
*Admin Zimlet for setting per user attachment limit.*
