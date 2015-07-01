# README #

M�dulo que gerencia:
 - o layout principal (app/index.html), exibindo somente o que o usu�rio tem permiss�o para acessar;
 - as rotas, que fazem refer�ncia a p�gina que � exibida na parte central da tela
 - a sele��o do grupo empresas para gerenciar (USU�RIO COM PERMISS�O ADMINISTRATIVA)
Esse � o m�dulo pai.
 
### Pra Que Serve Este M�dulo? ###

Gerenciar a tela principal (entre outros, menus e links), levando em considera��o as permiss�es do usu�rio autenticado. 

O controller se responsabiliza em avaliar a autentica��o do usu�rio, assim como a validade do token.

Os menus e suas op��es s�o exibidas conforme as permiss�es do usu�rio.

� neste m�dulo que s�o definidos tamb�m as rotas, isto �, os links para acessar as p�ginas do site. 



### O que � necess�rio para usar o m�dulo? ###

O m�dulo faz uso de m�dulos externos. Para cada um deles, devem ser adicionados os seguintes arquivos:
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |                MODULO                |                   DESCRI��O                       |          IMPORT (no index.html)        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |              ui.router               | Permite usar os factories $stateProvider, $state, |         angular-ui-router.min.js       |
 |                                      | $stateParams e $urlRouterProvider para fazer uso  |                                        |
 |                                      | das rotas do app, exibindo url amig�veis          |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |            ui.bootstrap              | Permite usar a directive typeahead em um input do |     ui-bootstrap-tpls-0.13.0.min.js    |
 |                                      | tipo "text", para usar o recurso do auto-completar|                                        |
 |                                      | eficiente da biblioteca                           |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |             diretivas                | Biblioteca que cont�m diretivas para uso no HTML  |             diretivas.js               |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |              servicos                | Biblioteca que cont�m constantes, fun��es e       |              services.js               |
 |                                      | informa��es �teis do projeto, como os links para  |                                        |
 |                                      | interagir com a WEB API e info da empresa         |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |           nao-autorizado             | M�dulo que gerencia a tela que reporta a n�o      |          nao-autorizado.js             |
 |                                      | autoriza��o do usu�rio ao acessar determinada     |                                        |
 |                                      | p�gina do website                                 |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |       administrativo-usuarios        | M�dulo que gerencia a tela de usu�rios da         |      gestao-acessos.usuarios.js        |
 |                                      | Gest�o de Acessos                                 |                                        |
 |                                      |                                                   |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |   administrativo-usuarios-cadastro   | M�dulo que gerencia a tela de cadastro/altera��o  |  gestao-acessos.usuarios.cadastro.js   |
 |                                      | de usu�rios da Gest�o de Acessos                  |                                        |
 |                                      |                                                   |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |             dashboard                | M�dulo que gerencia a tela de Dashboard           |              dashboard.js              |                                         |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |   card-services-conciliacao-vendas   | M�dulo que gerencia a tela de Concilia��o de      |   card-services.conciliacao-vendas.js  |                                         |
 |                                      | Vendas, referente ao servi�o Card Services        |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|

 
 ### Mudan�a de rotas/estados ###

 Todos os controllers filhos devem escutar o evento "mudancaDeRota", que tem como argumentos "state" e "params", como exibido a seguir:

		$scope.$on('mudancaDeRota', function(event, state, params){
            // Faz alguma verifica��o ....
			$state.go(state, params);
        }); 
		
 O estado s� � de fato modificado depois da execu��o do "$state.go(state, params);" interno � fun��o de escuta citado.
 Isso foi feito visando telas que possuem informa��es preenchidas pelo usu�rio e questiona se de fato ele deseja descart�-las antes de prosseguir.
 
 
 
 ### Intera��o com a local storage ###
 
 Na local storage, est� armazenado o token de acesso do usu�rio. O acesso � intermediado pela $localstorage, do m�dulo servicos (services.js)
 
 
 
 ### Intera��o com a WEB API ###
 
 Na inicializa��o do controller, � feita a valida��o do token armazenado na local storage, enviando ao servidor via WEB API.
  => GET(URL_LOGIN + '/' + token)
 - Se ocorrer o erro de c�digo 500, significa que o token n�o � (mais) v�lido, portanto, um novo login � requisitado.
 - Outro c�digo de erro � avaliado (sem resposta do servidor => nada acontece)
 
 Em caso de sucesso da valida��o do token, � esperado um objeto JSON do server com a seguinte estrutura:
 - nome (OB) : nome do usu�rio
 - token (OB) : token validado => atualiza valor na local storage
 - id_grupo (OP_A) : indica qual grupo empresa o usu�rio est� administrando
 - servicos (OP) : array que cont�m os servi�os o usu�rio tem acesso
   * titulo (OB) : titulo do servi�o ('Card Services', 'Tax Services', 'Administrativo', ...)
   * home (OP) : se o servi�o n�o possui subservi�os, indica que ele deve ser exibido na tela inicial
   * subServicos : array que cont�m os subservi�os associados ao servi�o
     ** t�tulo (OB) : t�tulo do subservi�o ('Consolida��o', 'Concilia��o', ...)
	 ** home (OP) : se o subservi�o n�o possui m�dulos, indica que ele deve ser exibido na tela inicial
	 ** modulos (OP) : array que cont�m os m�dulos do subservi�o
	    *** titulo (OB) : t�tulo do m�dulo ('Relat�rio Sint�tico', 'Concilia��o de Vendas', ...)
		*** home (OP) : indica que o m�dulo deve ser exibido na tela inicial
 
 LEGENDA: OB : Obrigat�rio  
		  OP : Opcional  
		  OP_A : Opcional para usu�rio com permiss�o admnistrativa
 
 
Esse JSON � fundamental para a exibi��o correta do layout. Regras:
 - Por se tratar de um menu, s� h� link nos n�veis mais baixos, isto �, se um menu possui submenu, ent�o n�o h� link para o menu.
   Exemplo: Menu 'Dashboard' n�o possui subMenus, ent�o existe um link para 'Dashboard'.
            Menu 'Card Services' possui subMenus, ent�o n�o existe um link direto para 'Card Services', mas sim para seus filhos.
 - A p�gina inicial � definida somente para elementos que podem possuir link direto, isto �, os de n�veis mais baixos
 - A p�gina inicial � referenciada pelo primeiro 'home=true' encontrado em um elemento de n�vel mais baixo
 
 
Padroniza��o dos t�tulos de servi�os, subservi�os e m�dulos:
 - Administrativo
	- Gest�o de Acessos (Cadastrar, Editar, Excluir)
		- Usu�rios (Resetar senha)
		- Privil�gios
		- M�dulos e Funcionalidades
	- Logs
		- Acesso de usu�rios
 - Dashboard
 - Card Services
	- Concilia��o
		- Concilia��o de Vendas
	- Consolida��o
		- Relat�rio Sint�tico
		- Relat�rio Anal�tico
   

   
### Desenvolvedores ###

Deivid Marinho - deividgfmarinho@gmail.com