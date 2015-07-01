# README #

Módulo que gerencia:
 - o layout principal (app/index.html), exibindo somente o que o usuário tem permissão para acessar;
 - as rotas, que fazem referência a página que é exibida na parte central da tela
 - a seleção do grupo empresas para gerenciar (USUÁRIO COM PERMISSÃO ADMINISTRATIVA)
Esse é o módulo pai.
 
### Pra Que Serve Este Módulo? ###

Gerenciar a tela principal (entre outros, menus e links), levando em consideração as permissões do usuário autenticado. 

O controller se responsabiliza em avaliar a autenticação do usuário, assim como a validade do token.

Os menus e suas opções são exibidas conforme as permissões do usuário.

É neste módulo que são definidos também as rotas, isto é, os links para acessar as páginas do site. 



### O que é necessário para usar o módulo? ###

O módulo faz uso de módulos externos. Para cada um deles, devem ser adicionados os seguintes arquivos:
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |                MODULO                |                   DESCRIÇÃO                       |          IMPORT (no index.html)        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |              ui.router               | Permite usar os factories $stateProvider, $state, |         angular-ui-router.min.js       |
 |                                      | $stateParams e $urlRouterProvider para fazer uso  |                                        |
 |                                      | das rotas do app, exibindo url amigáveis          |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |            ui.bootstrap              | Permite usar a directive typeahead em um input do |     ui-bootstrap-tpls-0.13.0.min.js    |
 |                                      | tipo "text", para usar o recurso do auto-completar|                                        |
 |                                      | eficiente da biblioteca                           |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |             diretivas                | Biblioteca que contém diretivas para uso no HTML  |             diretivas.js               |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |              servicos                | Biblioteca que contém constantes, funções e       |              services.js               |
 |                                      | informações úteis do projeto, como os links para  |                                        |
 |                                      | interagir com a WEB API e info da empresa         |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |           nao-autorizado             | Módulo que gerencia a tela que reporta a não      |          nao-autorizado.js             |
 |                                      | autorização do usuário ao acessar determinada     |                                        |
 |                                      | página do website                                 |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |       administrativo-usuarios        | Módulo que gerencia a tela de usuários da         |      gestao-acessos.usuarios.js        |
 |                                      | Gestão de Acessos                                 |                                        |
 |                                      |                                                   |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |   administrativo-usuarios-cadastro   | Módulo que gerencia a tela de cadastro/alteração  |  gestao-acessos.usuarios.cadastro.js   |
 |                                      | de usuários da Gestão de Acessos                  |                                        |
 |                                      |                                                   |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |             dashboard                | Módulo que gerencia a tela de Dashboard           |              dashboard.js              |                                         |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|
 |   card-services-conciliacao-vendas   | Módulo que gerencia a tela de Conciliação de      |   card-services.conciliacao-vendas.js  |                                         |
 |                                      | Vendas, referente ao serviço Card Services        |                                        |
 |--------------------------------------|---------------------------------------------------|----------------------------------------|

 
 ### Mudança de rotas/estados ###

 Todos os controllers filhos devem escutar o evento "mudancaDeRota", que tem como argumentos "state" e "params", como exibido a seguir:

		$scope.$on('mudancaDeRota', function(event, state, params){
            // Faz alguma verificação ....
			$state.go(state, params);
        }); 
		
 O estado só é de fato modificado depois da execução do "$state.go(state, params);" interno à função de escuta citado.
 Isso foi feito visando telas que possuem informações preenchidas pelo usuário e questiona se de fato ele deseja descartá-las antes de prosseguir.
 
 
 
 ### Interação com a local storage ###
 
 Na local storage, está armazenado o token de acesso do usuário. O acesso é intermediado pela $localstorage, do módulo servicos (services.js)
 
 
 
 ### Interação com a WEB API ###
 
 Na inicialização do controller, é feita a validação do token armazenado na local storage, enviando ao servidor via WEB API.
  => GET(URL_LOGIN + '/' + token)
 - Se ocorrer o erro de código 500, significa que o token não é (mais) válido, portanto, um novo login é requisitado.
 - Outro código de erro é avaliado (sem resposta do servidor => nada acontece)
 
 Em caso de sucesso da validação do token, é esperado um objeto JSON do server com a seguinte estrutura:
 - nome (OB) : nome do usuário
 - token (OB) : token validado => atualiza valor na local storage
 - id_grupo (OP_A) : indica qual grupo empresa o usuário está administrando
 - servicos (OP) : array que contém os serviços o usuário tem acesso
   * titulo (OB) : titulo do serviço ('Card Services', 'Tax Services', 'Administrativo', ...)
   * home (OP) : se o serviço não possui subserviços, indica que ele deve ser exibido na tela inicial
   * subServicos : array que contém os subserviços associados ao serviço
     ** título (OB) : título do subserviço ('Consolidação', 'Conciliação', ...)
	 ** home (OP) : se o subserviço não possui módulos, indica que ele deve ser exibido na tela inicial
	 ** modulos (OP) : array que contém os módulos do subserviço
	    *** titulo (OB) : título do módulo ('Relatório Sintético', 'Conciliação de Vendas', ...)
		*** home (OP) : indica que o módulo deve ser exibido na tela inicial
 
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
	- Gestão de Acessos (Cadastrar, Editar, Excluir)
		- Usuários (Resetar senha)
		- Privilégios
		- Módulos e Funcionalidades
	- Logs
		- Acesso de usuários
 - Dashboard
 - Card Services
	- Conciliação
		- Conciliação de Vendas
	- Consolidação
		- Relatório Sintético
		- Relatório Analítico
   

   
### Desenvolvedores ###

Deivid Marinho - deividgfmarinho@gmail.com