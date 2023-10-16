#!/bin/bash


case "$1" in

spellcheck)
	cd ..
	
	java -jar tools/spellchecker-0.0.1-SNAPSHOT.jar $PWD/src/app/modules/shared/services/mi-translate-loader.service.ts $PWD/project.dic
;;

*) 
	echo "Invalid option: $1"
	echo "Usage : $0 spellcheck"
	;;

esac
