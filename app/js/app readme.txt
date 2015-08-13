# README #

M�dulo que gerencia:
 - o layout principal (app/index.html), exibindo somente o que o usu�rio tem permiss�o para acessar;
 - as rotas, que fazem refer�ncia a p�gina que � exibida na parte central da tela
 - a sele��o do grupo empresas para gerenciar (USU�RIO COM PERMISS�O ADMINISTRATIVA)
 - modal e alert
Esse � o m�dulo pai.
 
 
### Pra Que Serve Este M�dulo? ###

Gerenciar a tela principal (entre outros, menus e links), levando em considera��o as permiss�es do usu�rio autenticado. 
O controller se responsabiliza em avaliar a autentica��o do usu�rio, assim como a validade do token.
Os menus e suas op��es s�o exibidas conforme as permiss�es do usu�rio.
� neste m�dulo que s�o definidos tamb�m as rotas, isto �, os links para acessar as p�ginas do site. 



### O que � necess�rio para usar o m�dulo? ###

O m�dulo faz uso de m�dulos externos. Para cada um deles, devem ser adicionados os seguintes arquivos:
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |                  MODULO                   |                   DESCRI��O                       |              IMPORT (no index.html)          |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |                 ui.router                 | Permite usar os factories $stateProvider, $state, |            angular-ui-router.min.js          |
 |                                           | $stateParams e $urlRouterProvider para fazer uso  |                                              |
 |                                           | das rotas do app, exibindo url amig�veis          |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |               ui.bootstrap                | Permite usar a directive typeahead em um input do |         ui-bootstrap-tpls-0.13.0.min.js      |
 |                                           | tipo "text", para usar o recurso do auto-completar|                                              |
 |                                           | eficiente da biblioteca                           |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |               ui.checkbox                 | Permite usar a directive <checkbox>em um input do |          angular-bootstrap-checkbox.js       |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |              angular.filter               | Permite uso de filtros personalizados do angular  |           	 angular-filter.min             |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |                diretivas                  | Biblioteca que cont�m diretivas personalizadas    |                  diretivas.js                |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |                  utils                    | Biblioteca que cont�m fun��es de acesso a local   |                   utils.js                   |
 |                                           | e session storage, fun��es http (get, post, put e |                                              |
 |                                           | delete), info da empresa e de autentica��o        |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |                 webapi                    | Biblioteca que cont�m constantes, URLs associadas |                   webapi.js                  |
 |                                           | e o padr�o adotado para intera��o com cada API    |                                              |
 |                                           | que o portal interage                             |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |             nao-autorizado                | M�dulo que gerencia a tela que reporta a n�o      |               nao-autorizado.js              |
 |                                           | autoriza��o do usu�rio ao acessar determinada     |                                              |
 |                                           | p�gina do website                                 |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |             nao-encontrado                | M�dulo que gerencia a tela que reporta a n�o      |               nao-encontrado.js              |
 |                                           | localiza��o de uma determinada p�gina requisitada |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |         administrativo-usuarios           | M�dulo que gerencia a tela de usu�rios da         |           administrativo.usuarios.js         |
 |                                           | Gest�o de Acessos                                 |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |     administrativo-usuarios-cadastro      | M�dulo que gerencia a tela de cadastro/altera��o  |      administrativo.usuarios.cadastro.js     |
 |                                           | de usu�rios da Gest�o de Acessos                  |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |         administrativo-privilegios        | M�dulo que gerencia a tela de privil�gios (roles) |        administrativo.privilegios.js         |
 |                                           | da Gest�o de Acessos                              |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |   administrativo-modulos-funcionalidades  | M�dulo que gerencia a tela de m�dulos (controller)|   administrativo.modulos-funcionalidades.js  |
 |                                           | e funcionalidades (method) da Gest�o de Acessos   |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |       administrativo-acesso-usuarios      | M�dulo que gerencia a tela de acesso de usu�rios, |      administrativo.acesso-usuarios.js       |
 |                                           | de Logs                                           |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |       administrativo-acoes-usuarios       | M�dulo que gerencia a tela de a��es de usu�rios,  |      administrativo.acoes-usuarios.js        |
 |                                           | de Logs                                           |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |         administrativo-empresas           | M�dulo que gerencia a tela de empresas da         |         administrativo.empresas.js           |
 |                                           | Gest�o de Empresas                                |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |         administrativo-filiais            | M�dulo que gerencia a tela de filiais da          |          administrativo.filiais.js           |
 |                                           | Gest�o de Empresas                                |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |     administrativo-filiais-cadastro       | M�dulo que gerencia a tela de cadastro/altera��o  |      administrativo.filiais.cadastro.js      |
 |                                           | de filiais da Gest�o de Empresas                  |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |       administrativo-dados-acesso         | M�dulo que gerencia a tela de dados de acesso     |        administrativo.dados-acesso.js        |
 |                                           | da Gest�o de Empresas                             |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |     administrativo-senhas-invalidas       | M�dulo que gerencia a tela de senhas inv�lidas    |      administrativo.senhas-invalidas.js      |
 |                                           | da Gest�o de Empresas                             |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |      administrativo-contas-correntes      | M�dulo que gerencia a tela de contas correntes    |      administrativo.contas-correntes.js      |
 |                                           | da Gest�o de Empresas                             |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |      administrativo-senhas-invalidas      | M�dulo que gerencia a tela de senhas inv�lidas    |      administrativo.senhas-invalidas.js      |
 |                                           | da Gest�o de Empresas                             |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 | administrativo-contas-correntes-vigencias | M�dulo que gerencia a tela de vig�ncias  de conta | administrativo.contas-correntes-vigencias.js |
 |                                           | corrente da Gest�o de Empresas                    |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |   administrativo-extratos-bancarios       | M�dulo que gerencia a tela de extratos banc�rios  |    administrativo.extratos-bancarios.js      |
 |                                           | da Gest�o de Empresas                             |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |             dashboard                     | M�dulo que gerencia a tela de Dashboard           |                dashboard.js                  | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |    card-services-cash-flow-relatorios     | M�dulo que gerencia a tela de Relat�rios          |    card-services.cash-flow.relatorios.js     |
 |                                           | do Cash Flow                                      |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |    card-services-conciliacao-bancaria     | M�dulo que gerencia a tela de Concilia��o         |    card-services.conciliacao-bancaria.js     |
 |                                           | Banc�ria da Concilia��o                           |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |      card-services-conciliacao-vendas     | M�dulo que gerencia a tela de Concilia��o de      |     card-services.conciliacao-vendas.js      |
 |                                           | Vendas da Concilia��o                             |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |   card-services-consolidacao-relatorios   | M�dulo que gerencia a tela de Relat�rios          |   card-services.consolidacao.relatorios.js   |
 |                                           | da Consolida��o                                   |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |                   conta                   | M�dulo que gerencia a tela Minha Conta            |                    conta.js                  |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |             conta-alterar-senha           | M�dulo que gerencia a tela de Alterar Senha       |              conta.alterar-senha.js          |
 |                                           | da Minha Conta                                    |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |              usuario-sem-link             | M�dulo que gerencia a tela que reporta que        |               usuario-sem-link.js            |
 |                                           | o usu�rio n�o possui nenhum controller do portal  |                                              |                                              |
 |                                           | associado ao privil�gio (caso esteja em algum)    |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|

 
 
 
 ### Mudan�a de rotas/estados ###

 Todos os controllers filhos devem escutar o evento "mudancaDeRota", que tem como argumentos "state" e "params", como exibido a seguir:

		$scope.$on('mudancaDeRota', function(event, state, params){
            // Faz alguma verifica��o ....
			$state.go(state, params);
        }); 
		
 O estado s� � de fato modificado depois da execu��o do "$state.go(state, params);" interno � fun��o de escuta citado.
 Isso foi feito visando telas que possuem informa��es preenchidas pelo usu�rio e questiona se de fato ele deseja descart�-las antes de prosseguir.
 
  Cada controller filho deve, no init, obter os m�todos permitidos para o controller corrente atrav�s de $scope.methodsDoControllerCorrente
 
 
 
 ### Log de acesso a tela ###
 
 Envia para a api qual a tela (controller) que est� sendo acessada.
 Para isso, cada filho deve emitir no init o evento "acessouTela", que � escutado pelo controller pai, respons�vel por 
 enviar para a API o idController.
 
 
 
 ### Intera��o com a local storage ###
 
 Na local storage, est� armazenado o token de acesso do usu�rio. O acesso � intermediado pela $localstorage, do m�dulo servicos (services.js)
 
 
 
 ### Intera��o com a WEB API ###
 
   * administracao/logacesso
	 - POST : loga a tela que est� sendo utilizada
	          {	
			    idController : int, // id da tela
			  }
 
   * administracao/webpagescontrollers
     - GET : OBTER PERMISS�ES DO USU�RIO NO CONTROLLER (cole��o 4)
		   url/token/?100=id_controller
		   Retorno: 
			[
			   { ds_method : string,
				 id_method : int
			   }		 
			 ]
	
	* api/administracao/webpagesusers
	 - PUT : Informar que um grupo empresa foi associado ou dessaciado na "catraca"
	       url/?token=...
		   Enviar como data o id_grupo (sem estar dentro de um json)
 
 
 Na inicializa��o do controller, � feita a valida��o do token armazenado na local storage, enviando ao servidor via WEB API.
  => GET(URL_API_LOGIN + '/' + token)
 - Se ocorrer o erro de c�digo 500, significa que o token n�o � (mais) v�lido, portanto, um novo login � requisitado.
 - Se ocorrer o erro de c�digo 401, significa que o usu�rio est� inativo ou, caso n�o seja perfil atos, o grupo e/ou filial 
   ao qual est� associado est� inativo => Volta para a tela de login
 - Outro c�digo de erro � avaliado (sem resposta do servidor => nada acontece)
 
 Em caso de sucesso da valida��o do token, � esperado um objeto JSON do server com a seguinte estrutura:
 - nome (OB) : nome do usu�rio
 - token (OB) : token validado => atualiza valor na local storage
 - id_grupo (OB) : indica qual grupo empresa o usu�rio est� associado
 - nu_cnpj (OB) : indica qual filial o usu�rio est� associado
 - filtro_empresa (OP_A) : indica se o usu�rio pode usar o filtro de empresa ("catraca")
 - controllers (OP) : array que cont�m os servi�os o usu�rio tem acesso
   * ds_controller (OB) : titulo do controller ('Card Services', 'Tax Services', 'Administrativo', ...)
   * id_controller (OB) : id do controller
   * methods (OB) : lista com os m�todos permitidos
   * home (OP) : se o controller n�o possui subControllers, indica que ele deve ser exibido na tela inicial
   * subControllers (OP) : array que cont�m os subControllers associados ao controller
     ** ds_controller
	 ** id_controller
	 ** methods
	 ** ...
 
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
	- Gest�o de Acessos
		- Usu�rios
		- Privil�gios
		- M�dulos e Funcionalidades
	- Logs
		- Acesso de usu�rios
 - Dashboard
 - Card Services
	- Concilia��o
		- Concilia��o de Vendas
	- Consolida��o
		- Relat�rios
		- Dados de acesso
   

   
### Desenvolvedores ###

Deivid Marinho - deividgfmarinho@gmail.com