# README #

Módulo que gerencia:
 - o layout principal (app/index.html), exibindo somente o que o usuário tem permissão para acessar;
 - as rotas, que fazem referência a página que é exibida na parte central da tela
 - a seleção do grupo empresas para gerenciar (USUÁRIO COM PERMISSÃO ADMINISTRATIVA)
 - modal e alert
Esse é o módulo pai.
 
 
### Pra Que Serve Este Módulo? ###

Gerenciar a tela principal (entre outros, menus e links), levando em consideração as permissões do usuário autenticado. 
O controller se responsabiliza em avaliar a autenticação do usuário, assim como a validade do token.
Os menus e suas opções são exibidas conforme as permissões do usuário.
É neste módulo que são definidos também as rotas, isto é, os links para acessar as páginas do site. 



### O que é necessário para usar o módulo? ###

O módulo faz uso de módulos externos. Para cada um deles, devem ser adicionados os seguintes arquivos:
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |                  MODULO                   |                   DESCRIÇÃO                       |              IMPORT (no index.html)          |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |                 ui.router                 | Permite usar os factories $stateProvider, $state, |            angular-ui-router.min.js          |
 |                                           | $stateParams e $urlRouterProvider para fazer uso  |                                              |
 |                                           | das rotas do app, exibindo url amigáveis          |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |               ui.bootstrap                | Permite usar a directive typeahead em um input do |         ui-bootstrap-tpls-0.13.0.min.js      |
 |                                           | tipo "text", para usar o recurso do auto-completar|                                              |
 |                                           | eficiente da biblioteca                           |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |               ui.checkbox                 | Permite usar a directive <checkbox>em um input do |          angular-bootstrap-checkbox.js       |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |              angular.filter               | Permite uso de filtros personalizados do angular  |           	 angular-filter.min             |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |                diretivas                  | Biblioteca que contém diretivas personalizadas    |                  diretivas.js                |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |                  utils                    | Biblioteca que contém funções de acesso a local   |                   utils.js                   |
 |                                           | e session storage, funções http (get, post, put e |                                              |
 |                                           | delete), info da empresa e de autenticação        |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |                 webapi                    | Biblioteca que contém constantes, URLs associadas |                   webapi.js                  |
 |                                           | e o padrão adotado para interação com cada API    |                                              |
 |                                           | que o portal interage                             |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |             nao-autorizado                | Módulo que gerencia a tela que reporta a não      |               nao-autorizado.js              |
 |                                           | autorização do usuário ao acessar determinada     |                                              |
 |                                           | página do website                                 |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |             nao-encontrado                | Módulo que gerencia a tela que reporta a não      |               nao-encontrado.js              |
 |                                           | localização de uma determinada página requisitada |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |         administrativo-usuarios           | Módulo que gerencia a tela de usuários da         |           administrativo.usuarios.js         |
 |                                           | Gestão de Acessos                                 |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |     administrativo-usuarios-cadastro      | Módulo que gerencia a tela de cadastro/alteração  |      administrativo.usuarios.cadastro.js     |
 |                                           | de usuários da Gestão de Acessos                  |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |         administrativo-privilegios        | Módulo que gerencia a tela de privilégios (roles) |        administrativo.privilegios.js         |
 |                                           | da Gestão de Acessos                              |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |   administrativo-modulos-funcionalidades  | Módulo que gerencia a tela de módulos (controller)|   administrativo.modulos-funcionalidades.js  |
 |                                           | e funcionalidades (method) da Gestão de Acessos   |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |       administrativo-acesso-usuarios      | Módulo que gerencia a tela de acesso de usuários, |      administrativo.acesso-usuarios.js       |
 |                                           | de Logs                                           |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |       administrativo-acoes-usuarios       | Módulo que gerencia a tela de ações de usuários,  |      administrativo.acoes-usuarios.js        |
 |                                           | de Logs                                           |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |         administrativo-empresas           | Módulo que gerencia a tela de empresas da         |         administrativo.empresas.js           |
 |                                           | Gestão de Empresas                                |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |         administrativo-filiais            | Módulo que gerencia a tela de filiais da          |          administrativo.filiais.js           |
 |                                           | Gestão de Empresas                                |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |     administrativo-filiais-cadastro       | Módulo que gerencia a tela de cadastro/alteração  |      administrativo.filiais.cadastro.js      |
 |                                           | de filiais da Gestão de Empresas                  |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |       administrativo-dados-acesso         | Módulo que gerencia a tela de dados de acesso     |        administrativo.dados-acesso.js        |
 |                                           | da Gestão de Empresas                             |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |     administrativo-senhas-invalidas       | Módulo que gerencia a tela de senhas inválidas    |      administrativo.senhas-invalidas.js      |
 |                                           | da Gestão de Empresas                             |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |      administrativo-contas-correntes      | Módulo que gerencia a tela de contas correntes    |      administrativo.contas-correntes.js      |
 |                                           | da Gestão de Empresas                             |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |      administrativo-senhas-invalidas      | Módulo que gerencia a tela de senhas inválidas    |      administrativo.senhas-invalidas.js      |
 |                                           | da Gestão de Empresas                             |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 | administrativo-contas-correntes-vigencias | Módulo que gerencia a tela de vigências  de conta | administrativo.contas-correntes-vigencias.js |
 |                                           | corrente da Gestão de Empresas                    |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |   administrativo-extratos-bancarios       | Módulo que gerencia a tela de extratos bancários  |    administrativo.extratos-bancarios.js      |
 |                                           | da Gestão de Empresas                             |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |             dashboard                     | Módulo que gerencia a tela de Dashboard           |                dashboard.js                  | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |    card-services-cash-flow-relatorios     | Módulo que gerencia a tela de Relatórios          |    card-services.cash-flow.relatorios.js     |
 |                                           | do Cash Flow                                      |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |    card-services-conciliacao-bancaria     | Módulo que gerencia a tela de Conciliação         |    card-services.conciliacao-bancaria.js     |
 |                                           | Bancária da Conciliação                           |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |      card-services-conciliacao-vendas     | Módulo que gerencia a tela de Conciliação de      |     card-services.conciliacao-vendas.js      |
 |                                           | Vendas da Conciliação                             |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |   card-services-consolidacao-relatorios   | Módulo que gerencia a tela de Relatórios          |   card-services.consolidacao.relatorios.js   |
 |                                           | da Consolidação                                   |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |                   conta                   | Módulo que gerencia a tela Minha Conta            |                    conta.js                  |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |             conta-alterar-senha           | Módulo que gerencia a tela de Alterar Senha       |              conta.alterar-senha.js          |
 |                                           | da Minha Conta                                    |                                              |
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|
 |              usuario-sem-link             | Módulo que gerencia a tela que reporta que        |               usuario-sem-link.js            |
 |                                           | o usuário não possui nenhum controller do portal  |                                              |                                              |
 |                                           | associado ao privilégio (caso esteja em algum)    |                                              | 
 |-------------------------------------------|---------------------------------------------------|----------------------------------------------|

 
 
 
 ### Mudança de rotas/estados ###

 Todos os controllers filhos devem escutar o evento "mudancaDeRota", que tem como argumentos "state" e "params", como exibido a seguir:

		$scope.$on('mudancaDeRota', function(event, state, params){
            // Faz alguma verificação ....
			$state.go(state, params);
        }); 
		
 O estado só é de fato modificado depois da execução do "$state.go(state, params);" interno à função de escuta citado.
 Isso foi feito visando telas que possuem informações preenchidas pelo usuário e questiona se de fato ele deseja descartá-las antes de prosseguir.
 
  Cada controller filho deve, no init, obter os métodos permitidos para o controller corrente através de $scope.methodsDoControllerCorrente
 
 
 
 ### Log de acesso a tela ###
 
 Envia para a api qual a tela (controller) que está sendo acessada.
 Para isso, cada filho deve emitir no init o evento "acessouTela", que é escutado pelo controller pai, responsável por 
 enviar para a API o idController.
 
 
 
 ### Interação com a local storage ###
 
 Na local storage, está armazenado o token de acesso do usuário. O acesso é intermediado pela $localstorage, do módulo servicos (services.js)
 
 
 
 ### Interação com a WEB API ###
 
   * administracao/logacesso
	 - POST : loga a tela que está sendo utilizada
	          {	
			    idController : int, // id da tela
			  }
 
   * administracao/webpagescontrollers
     - GET : OBTER PERMISSÕES DO USUÁRIO NO CONTROLLER (coleção 4)
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
 
 
 Na inicialização do controller, é feita a validação do token armazenado na local storage, enviando ao servidor via WEB API.
  => GET(URL_API_LOGIN + '/' + token)
 - Se ocorrer o erro de código 500, significa que o token não é (mais) válido, portanto, um novo login é requisitado.
 - Se ocorrer o erro de código 401, significa que o usuário está inativo ou, caso não seja perfil atos, o grupo e/ou filial 
   ao qual está associado está inativo => Volta para a tela de login
 - Outro código de erro é avaliado (sem resposta do servidor => nada acontece)
 
 Em caso de sucesso da validação do token, é esperado um objeto JSON do server com a seguinte estrutura:
 - nome (OB) : nome do usuário
 - token (OB) : token validado => atualiza valor na local storage
 - id_grupo (OB) : indica qual grupo empresa o usuário está associado
 - nu_cnpj (OB) : indica qual filial o usuário está associado
 - filtro_empresa (OP_A) : indica se o usuário pode usar o filtro de empresa ("catraca")
 - controllers (OP) : array que contém os serviços o usuário tem acesso
   * ds_controller (OB) : titulo do controller ('Card Services', 'Tax Services', 'Administrativo', ...)
   * id_controller (OB) : id do controller
   * methods (OB) : lista com os métodos permitidos
   * home (OP) : se o controller não possui subControllers, indica que ele deve ser exibido na tela inicial
   * subControllers (OP) : array que contém os subControllers associados ao controller
     ** ds_controller
	 ** id_controller
	 ** methods
	 ** ...
 
 LEGENDA: OB : Obrigatório  
		  OP : Opcional  
		  OP_A : Opcional para usuário com permissão admnistrativa
 
 
Esse JSON é fundamental para a exibição correta do layout. Regras:
 - Por se tratar de um menu, só há link nos níveis mais baixos, isto é, se um menu possui submenu, então não há link para o menu.
   Exemplo: Menu 'Dashboard' não possui subMenus, então existe um link para 'Dashboard'.
            Menu 'Card Services' possui subMenus, então não existe um link direto para 'Card Services', mas sim para seus filhos.
 - A página inicial é definida somente para elementos que podem possuir link direto, isto é, os de níveis mais baixos
 - A página inicial é referenciada pelo primeiro 'home=true' encontrado em um elemento de nível mais baixo
 
 
Padronização dos títulos de serviços, subserviços e módulos:
 - Administrativo
	- Gestão de Acessos
		- Usuários
		- Privilégios
		- Módulos e Funcionalidades
	- Logs
		- Acesso de usuários
 - Dashboard
 - Card Services
	- Conciliação
		- Conciliação de Vendas
	- Consolidação
		- Relatórios
		- Dados de acesso
   

   
### Desenvolvedores ###

Deivid Marinho - deividgfmarinho@gmail.com