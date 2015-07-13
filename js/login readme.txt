# README #

M�dulo que gerencia:
 - o layout de login (index.html);
 - cadastro de um novo cliente (degusta��o);
 - esqueci a senha (envia por e-mail);
 
 
### Pra Que Serve Este M�dulo? ###

Gerenciar a tela de login. 
O controller se responsabiliza em avaliar o login e a validade do token.
Em caso de sucesso de login/autentica��o, realiza o redirecionamento para a app/index.html



### O que � necess�rio para usar o m�dulo? ###

O m�dulo faz uso de m�dulos externos. Para cada um deles, devem ser adicionados os seguintes arquivos:
 |----------------------------------------|---------------------------------------------------|-------------------------------------------|
 |                MODULO                  |                   DESCRI��O                       |            IMPORT (no index.html)         |
 |----------------------------------------|---------------------------------------------------|-------------------------------------------|
 |               utils                    | Biblioteca que cont�m fun��es de acesso a local   |                  utils.js                 |
 |                                        | e session storage, fun��es http (get, post, put e |                                           |
 |                                        | delete), info da empresa e de autentica��o        |                                           |
 |----------------------------------------|---------------------------------------------------|-------------------------------------------|

 
 
 ### Intera��o com a local storage ###
 
 Na local storage, est� armazenado o token de acesso do usu�rio. O acesso � intermediado pela $localstorage, do m�dulo servicos (services.js)
 
 
 
 ### Intera��o com a WEB API ###
 
 Na inicializa��o do controller, � verificado se existe token armazenado na local storage e se ele n�o expirou. 
 Caso o token esteja v�lido, � feito o redirecionamento para a p�gina app/index.html.
 Caso contr�rio, a tela de login � exibida, ao qual o usu�rio deve entrar com um login e senha.
 Somente com a valida��o da autentica��o (enviada via POST para a webapi /login/autenticacao/) que a p�gina � redirecionada para a app/index.html.
   

   
### Desenvolvedores ###

Deivid Marinho - deividgfmarinho@gmail.com