/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("AtosCapital", ['ui.router', 
                               'ui.bootstrap', 
                               'servicos', 
                               'nao-autorizado', 
                               'administrativo-usuarios',
                               'dashboard', 
                               'card-services-conciliacao-vendas']) 

.controller("appCtrl", ['$scope',
                        '$rootScope',
                        '$location',
                        '$state',
                        '$stateParams',
                        '$http',
                        '$timeout',
                        '$autenticacao',
                        '$apis',
                        '$webapi',
                        '$empresa',
                        '$campos',
                        '$filter',
                        function($scope,$rootScope,$location,$state,$stateParams,$http,$timeout,
                                 $autenticacao,$apis,$webapi,$empresa,$campos,$filter){ 
    // Título da página                            
    $scope.pagina = {'titulo': 'Home', 'subtitulo': ''};
    // Usuário
    $scope.nome_usuario = 'Usuário';
    // Dados da empresa
    $scope.empresa = $empresa;
    // Grupo empresa selecionado
    var empresaId = -1; // se > 0 indica que já estava associado a um grupo empresa
    $scope.grupoempresas = [];
    $scope.grupoempresa = null; // grupo empresa em uso
    $scope.gempresa = null;  // objeto que recebe temporariamente o grupo empresa da busca
    // URL das páginas
    var telaLogin = '../';
    // Flag
    $scope.exibeLayout = false; // true => carrega layout completo
    $scope.carregandoGrupoEmpresas = false; // indica se está aguardando o objeto com os grupos empresa (para usuário administrativo)
    // Permissões
    $scope.PERMISSAO_ADMINISTRATIVO = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_USUARIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PRIVILEGIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_MODULOS_FUNCIONALIDADES = false;
    $scope.PERMISSAO_ADMINISTRATIVO_LOGS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACESSO_USUARIOS = false;
    $scope.PERMISSAO_DASHBOARD = false;
    $scope.PERMISSAO_CARD_SERVICES = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_VENDAS = false;
    

                            
    // LINKS
    $scope.goAdministrativoUsuarios = function(){
        $state.go('administrativo-gestao-acesso-usuarios'); 
    };
    $scope.goAdministrativoUsuariosCadastro = function(){
        $state.go('administrativo-gestao-acesso-usuarios-cadastro'); // CADASTRO É TEMPORÁRIO
    };
    $scope.goDashboard = function(){
        //if(!$state.is('dashboard')) 
            $state.go('dashboard');
        //else console.log("JA ESTÁ NO DASHBOARD");
    };
    $scope.goCardServicesConciliacaoVendas = function(){
        $state.go('card-services-conciliacao-vendas');
    }; 
    // Valida o acesso a url
    $rootScope.$on("$locationChangeStart", function(event, next, current){
        //console.log("FROM " + current + " TO " + next);
        var url = next.split('#')[1];
        // Avalia
        if(url === $state.get('administrativo-gestao-acesso-usuarios').url || url === $state.get('administrativo-gestao-acesso-usuarios-cadastro').url){ 
            // Gestão de Acesso > Usuários (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_USUARIOS){
                // Não possui permissão!
                event.preventDefault();
                $state.go('nao-autorizado');
            }
        }else if(url === $state.get('dashboard').url){ 
            // Dashboard
            if(!$scope.PERMISSAO_DASHBOARD){
                // Não possui permissão!
                event.preventDefault();
                $state.go('nao-autorizado');
            }
        }else if(url === $state.get('card-services-conciliacao-vendas').url){ 
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_VENDAS){
                // Não possui permissão!
                event.preventDefault();
                $state.go('nao-autorizado');
            }
        }//else event.preventDefault();//console.log("VAI PARA ONDE?");
     });
                            
    // Retorna para a tela de login
    $scope.voltarTelaLogin = function(){
        $autenticacao.removeDadosDeAutenticacao();
        window.location.replace(telaLogin);
    };   
    // Retorna a função para fazer o link para o item com o título informado
    var getLink = function(titulo){
        switch(titulo.toUpperCase()){
            // Administrativo
            case 'USUÁRIOS' : return $scope.goAdministrativoUsuarios;
            // Dashboard
            case 'DASHBOARD': return $scope.goDashboard;  
            // Card Services
            case 'CONCILIAÇÃO DE VENDAS': return $scope.goCardServicesConciliacaoVendas;
            // ...
            default : return function(){};        
        }
    };
    
    // PERMISSÕES
    // Atribui a permissão para o respectivo título
    var atribuiPermissao = function(titulo){ // , tituloPai){ // enviar titulo do pai? Pode ser útil se, por exemplo, existir algo do tipo: 'Conciliacao' em Card Services e em Tax Services...
        switch(titulo.toUpperCase()){
            // Administrativo
            case 'ADMINISTRATIVO' : $scope.PERMISSAO_ADMINISTRATIVO = true; break;
            case 'GESTÃO DE ACESSOS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS = true; break;
            case 'USUÁRIOS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_USUARIOS = true; break;
            case 'PRIVILÉGIOS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PRIVILEGIOS = true; break;
            case 'MÓDULOS E FUNCIONALIDADES' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_MODULOS_FUNCIONALIDADES = true; break;
            case 'LOGS' : $scope.PERMISSAO_ADMINISTRATIVO_LOGS = true; break;
            case 'ACESSO DE USUÁRIOS' : $scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACESSO_USUARIOS = true; break;
            // Dashboard
            case 'DASHBOARD': $scope.PERMISSAO_DASHBOARD = true; break;
            // Card Services
            case 'CARD SERVICES': $scope.PERMISSAO_CARD_SERVICES = true; break;
            case 'CONCILIAÇÃO': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO = true; break;
            case 'CONCILIAÇÃO DE VENDAS': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_VENDAS = true; break;
            // ...
            default : return ;        
        }
    };
             
    // LAYOUT  
    $scope.menuAtivo = function(titulo){
        var state = $state.current.url.split('/')[1]; // nome da pasta inicial da url do estado atual
        switch(titulo.toUpperCase()){
            // Administrativo
            case 'ADMINISTRATIVO' : return state == 'administrativo';
            // Dashboard
            case 'DASHBOARD': return state == 'dashboard';
            // Card Services
            case 'CARD SERVICES': return state == 'card-services';
                
            default : return false;        
        }
        
    };
    // A partir do JSON recebido, obtem o JSON menu e as permissões do usuário
    var constroiMenu = function(data){
        // Exemplo
        data.id_grupo = 42;
        data.servicos = [
            {
                titulo : 'Dashboard',
                home : true
            },
            {
                titulo : 'Card Services',
                subServicos : [
                    {
                        titulo : 'Conciliação', 
                        modulos : [
                            {
                                titulo : 'Conciliação de Vendas',
                                // Pq em JSON? Pq pode ser a página inicial do cara, enviando assim o 'home=true' aqui!
                            }
                        ]
                    },
                    {
                        titulo : 'Consolidação', 
                        modulos : [
                            {
                                titulo : 'Relatório Sintético'
                            },
                            {
                                titulo : 'Relatório Analítico'
                            }
                        ]
                    }
                ]
            },
            {
                titulo : 'Administrativo', // possui perfil administrativo
                subServicos : [
                    {
                        titulo : 'Gestão de Acessos', 
                        modulos : [
                            {
                                titulo : 'Usuários'
                            },
                            {
                                titulo : 'Privilégios'
                            },
                            {
                                titulo : 'Módulos e Funcionalidades'
                            }
                        ]
                    },
                    {
                        titulo : 'Logs', 
                        modulos : [
                            {
                                titulo : 'Acesso de usuários'
                            }
                        ]
                    }
                ]
            }
        ];
        
        // Verifica se estava administrando algum grupo empresa
        if(data.id_grupo) empresaId = data.id_grupo;
        // Constrói o menu
        $scope.menu = [];
        for(var k = 0; k < data.servicos.length; k++){
            var servico = data.servicos[k];
            var menu = {};
            menu.titulo = servico.titulo;
            // Atribui permissão
            atribuiPermissao(menu.titulo);
            // Verifica se estava administrando algum grupo empresa
            if(servico.id_grupo) empresaId = servico.id_grupo;
            
            // Subserviços
            if(servico.subServicos){
                menu.subServicos = [];
                for(var j = 0; j < servico.subServicos.length; j++){
                    var subServico = servico.subServicos[j];
                    var subMenu = {};
                    subMenu.titulo = subServico.titulo;
                    // Atribui permissão
                    atribuiPermissao(subMenu.titulo);
                    
                    // Módulos
                    if(subServico.modulos){
                        subMenu.modulos = [];
                        for(var i = 0; i < subServico.modulos.length; i++){
                            var modulo = subServico.modulos[i];
                            var itemMenu = {};
                            itemMenu.titulo = modulo.titulo;
                            // Atribui permissão
                            atribuiPermissao(itemMenu.titulo);
                            itemMenu.link = getLink(itemMenu.titulo);
                            if(modulo.home && !$scope.goHome) $scope.goHome = itemMenu.link;
                            // Adiciona o módulo
                            subMenu.modulos.push(itemMenu);
                        }
                    }else{
                        // Se não tem módulos, então deve ter um link
                        subMenu.link = getLink(subMenu.titulo); 
                        // Página inicial é definido pelo primeiro 'home=true' encontrado        
                        if(subServico.home && !$scope.goHome) $scope.goHome = subMenu.link;
                    }
                    
                    // Adiciona o subserviço
                    menu.subServicos.push(subMenu);
                }
            }else{
                // Se não tem subserviços, então deve ter um link
                menu.link = getLink(menu.titulo); 
                // Página inicial é definido pelo primeiro 'home=true' encontrado        
                if(servico.home && !$scope.goHome) $scope.goHome = menu.link;
            }
            
            // Adiciona o menu
            $scope.menu.push(menu);
        }
        
        // Exibe tela inicial
        $scope.goHome();
    };
    // Inicializa layout
    var inicializaLayout = function(){
        // Avalia permissões....
        if($scope.PERMISSAO_ADMINISTRATIVO) $scope.obtemGrupoEmpresas(false);

        // Atualiza último datetime de autenticação
        $autenticacao.atualizaDateTimeDeAutenticacao(new Date());
        // Carrega todos os handlers de layout
        jQuery(document).ready(function() { 
        //$rootScope.$on('$viewContentLoaded', function(){
           Metronic.init(); // init metronic core componets
           Layout.init(); // init layout
           Tasks.initDashboardWidget(); // init tash dashboard widget   
        });
        $scope.exibeLayout = true;   
    };
    
    
    // Inicialização do controller
    $scope.init = function(){
        // Verifica se está autenticado
        if(!$autenticacao.usuarioEstaAutenticado()){ 
            $scope.voltarTelaLogin();
            return;
        }
        // Obtém o token
        var token = $autenticacao.getToken();
        if(!token){ 
            $autenticacao.removeDadosDeAutenticacao();
            $scope.voltarTelaLogin(); // what?! FATAL ERROR!
            return;
        }
        // Avalia Token
        var dadosAPI = $webapi.get($apis.autenticacao.login, token);
        // Verifica se a requisição foi respondida com sucesso
        dadosAPI.then(function(dados){
                            // Nome do usuário
                            $scope.nome_usuario = dados.nome;
                            // Atualiza token na local storage
                            token = dados.token;
                            $autenticacao.atualizaToken(token);
                            // Controi menu e obtem as permissões do usuário
                            constroiMenu(dados);
                            // Inicializa o layout
                            inicializaLayout();
                        },
                        function(failData){
                          // Avaliar código de erro
                          if(failData.status === 500)
                              // Código 500 => Token já não é mais válido
                              $scope.voltarTelaLogin();
                          else{ 
                              console.log("FALHA AO VALIDAR TOKEN: " + /*failData.*/status);
                              // o que fazer? exibir uma tela indicando falha de comunicação?
                              // Status 0: sem resposta
                          }
                        });
    };
                            
    // GRUPO EMPRESA
                            
    // Reporta se está em progresso de autenticação
    var progressoGrupoEmpresas = function(emProgresso){
        $scope.carregandoGrupoEmpresas = emProgresso;
        if(!$scope.$$phase) $scope.$apply();
    };
    // Requisita a lista dos grupo empresas registrados no servidor                      
    $scope.obtemGrupoEmpresas = function(refresh){
       if($scope.grupoempresas.length == 0 || refresh){ 
           // Obtem um novo registro
           $scope.grupoempresas.length = 0;
           progressoGrupoEmpresas(true);
           $scope.grupoempresa = null;
           $scope.gempresa = null; 
           // Solução jQuery (devido ao domínio diferente, a solução com angular não funciona)
           var dadosAPI = $webapi.get($apis.cliente.grupos.cardServices, ''); // temp (sem token)
           // Verifica se a requisição foi respondida com sucesso
           dadosAPI.then(function(dados){
                            $scope.grupoempresas = dados;
                            // O usuário já tinha se associado a um grupo empresa?
                            if(empresaId > 0)
                                // Obtem o grupo empresa
                                $scope.grupoempresa = $filter('filter')($scope.grupoempresas, {empresaId:empresaId})[0];
                            progressoGrupoEmpresas(false);
                          },
                          function(failData){
                             console.log("FALHA AO OBTER GRUPO EMPRESAS: " + failData.status);
                             progressoGrupoEmpresas(false);
                          });
        }
    };
    // Seleciona Grupo Empresa
    $scope.selecionaGrupoEmpresa = function(grupoempresa){
        $scope.grupoempresa = grupoempresa;
        $scope.gempresa = null; // reinicia o valor
        // Remove da visão a tela de busca do grupo empresa
        $('#admBuscaGrupoEmpresa').parent().removeClass('open');
        // Envia 
        // ....
    };
    // Limpar Grupo Empresa
    $scope.limpaGrupoEmpresa = function(){
        $scope.grupoempresa = null;
        // Envia
        // ....
    };
}])

.config(['$stateProvider','$urlRouterProvider','$locationProvider', function($stateProvider,$urlRouterProvider,$locationProvider) {
    
    var prefixo = '/';
    
    /* Remover o '#'
    if(window.history && window.history.pushState){ 
        $locationProvider.html5Mode({enabled: true, requireBase: false});
        prefixo = 'app/';
    }*/
    
    $urlRouterProvider.otherwise(prefixo + 'dashboard');
    
    $stateProvider

      // ADMINISTRATIVO
    
      .state('administrativo-gestao-acesso-usuarios', {
        url: prefixo + 'administrativo/usuarios',
        templateUrl: 'componentes/administrativo/gestao-acessos/usuarios/index.html',
        controller: "administrativo-usuariosCtrl"
      })
    
      .state('administrativo-gestao-acesso-usuarios-cadastro', {
        url: prefixo + 'administrativo/cadastro-usuarios',
        templateUrl: 'componentes/administrativo/gestao-acessos/usuarios/cadastro.html',
        controller: "administrativo-usuarios-cadastroCtrl"
      })
    
      // DASHBOARD
      .state('dashboard', {
        url: prefixo + 'dashboard',
        templateUrl: 'componentes/dashboard/index.html',
        controller: "dashboardCtrl"
      })
    
      // CARD SERVICES
      /*.state('card-services', {
        abstract: true
      })*/
    
      .state('card-services-conciliacao-vendas', {
        url: prefixo + 'card-services/conciliacao-vendas',
        templateUrl: 'componentes/card-services/conciliacao/conciliacao-vendas/index.html',
        controller: "card-services-conciliacao-vendasCtrl"
      })
    
      .state('nao-autorizado', {
        url: prefixo + 'nao-autorizado',
        templateUrl: 'componentes/nao-autorizado/index.html',
        controller: "nao-autorizadoCtrl"
      })
    
}])

// Init global settings and run the app
.run(['$rootScope', '$location', function($rootScope, $location) {
    // ....
}]);