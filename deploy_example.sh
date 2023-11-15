#!/bin/bash
if test -f output.tar.gz; then
	rm output.tar.gz
fi

# do you have nodejs installed? build the latest here
# node build

cd dist && tar -czf ../output.tar.gz ./* && cd ../ && sftp -i ~/.ssh/pkey user@hostname:/var/www/dist <<EOF
put output.tar.gz
exit
EOF

ssh -i ~/.ssh/pkey user@hostname 'bash -s' < update_example.sh
rm output.tar.gz
