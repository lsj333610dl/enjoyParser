#! /bin/bash


# 루프를 돌면서 interval 간격으로 명령을 실행한다.
# while [ 1 ]
# do
#     npm start
#     sleep 10
#     ^c 
# done

while [ 1 ]
do
	forever start ./bin/www
	forever list
	sleep 900
	forever stop 0
done
