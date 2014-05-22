#! /bin/bash


# 루프를 돌면서 interval 간격으로 명령을 실행한다.
# while [ 1 ]
# do
#     npm start
#     sleep 10
#     ^c 
# done


forever start ./bin/www
forever list
sleep 60*10
forever restart 0