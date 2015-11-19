# README #

Módulo que gerencia:
 - o layout de login (index.html);
 - cadastro de um novo cliente (degustação);
 - esqueci a senha (envia por e-mail);
 
 
### Pra Que Serve Este Módulo? ###

Gerenciar a tela de login. 
O controller se responsabiliza em avaliar o login e a validade do token.
Em caso de sucesso de login/autenticação, realiza o redirecionamento para a app/index.html



### O que é necessário para usar o módulo? ###

O módulo faz uso de módulos externos. Para cada um deles, devem ser adicionados os seguintes arquivos:
 |----------------------------------------|---------------------------------------------------|-------------------------------------------|
 |                MODULO                  |                   DESCRIÇÃO                       |            IMPORT (no index.html)         |
 |----------------------------------------|---------------------------------------------------|-------------------------------------------|
 |               utils                    | Biblioteca que contém funções de acesso a local   |                  utils.js                 |
 |                                        | e session storage, funções http (get, post, put e |                                           |
 |                                        | delete), info da empresa e de autenticação        |                                           |
 |----------------------------------------|---------------------------------------------------|-------------------------------------------|

 
 
 ### Interação com a local storage ###
 
 Na local storage, está armazenado o token de acesso do usuário. O acesso é intermediado pela $localstorage, do módulo servicos (services.js)
 
 
 
 ### Interação com a WEB API ###
 
 Na inicialização do controller, é verificado se existe token armazenado na local storage e se ele não expirou. 
 Caso o token esteja válido, é feito o redirecionamento para a página app/index.html.
 Caso contrário, a tela de login é exibida, ao qual o usuário deve entrar com um login e senha.
 Somente com a validação da autenticação (enviada via POST para a webapi /login/autenticacao/) que a página é redirecionada para a app/index.html.
   

   
### Desenvolvedores ###

Deivid Marinho - deividgfmarinho@gmail.com