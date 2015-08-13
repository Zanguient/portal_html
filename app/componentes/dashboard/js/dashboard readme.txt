# README #

Módulo que:
 - gerencia o layout da tela de Dashboard (app/componentes/dashboard/index.html);
 

### Pra Que Serve Este Módulo? ###

Gerenciar completamente a tela de Dashboard.  



### O que é necessário para usar o módulo? ###

Como esse é um controller filho do controller principal "appCtrl" (app.js), ele herda todos os módulos importados por ele.
Além deles, é necessária a importação dos seguintes módulos externos.

 |----------------------------------------|---------------------------------------------------|-------------------------------------------|
 |                MODULO                  |                   DESCRIÇÃO                       |         IMPORT (no app/index.html)        |
 |----------------------------------------|---------------------------------------------------|-------------------------------------------|
 |                       
 |----------------------------------------|---------------------------------------------------|-------------------------------------------|


 
### Outras depêndencias ###

  * Evento "mudancaDeRota", proveniente do "appCtrl", para de fato modificar a rota/estado
  * $scope.token do "appCtrl"
  * Emite evento "acessouTela" no init do controller para que seja feito o log de acesso de tela
  * $scope.grupoempresa, do "appCtrl" : grupo empresa informado pelo usuário na barra administrativa
  * Evento "alterouGrupoEmpresa", emitido pelo controller "appCtrl", para identificar a mudança do $scope.grupoempresa
  * APIS:
	- 
	
 
 
 ### Interação com a WEB API ###
 
  
   

   
### Desenvolvedores ###

Deivid Marinho - deividgfmarinho@gmail.com