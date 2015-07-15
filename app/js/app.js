/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("AtosCapital", ['ui.router', 
                               'ui.bootstrap',
                               'ui.checkbox',
                               'angular.filter',
                               'diretivas',
                               'utils',
                               'webapi', 
                               'nao-autorizado', 
                               'nao-encontrado',
                               'administrativo-usuarios',
                               'administrativo-usuarios-cadastro',
                               'administrativo-privilegios',
                               'administrativo-modulos-funcionalidades',
                               'administrativo-acesso-usuarios',
                               'administrativo-empresas',
                               'administrativo-filiais',
                               'dashboard', 
                               'card-services-conciliacao-vendas',
                               'card-services-dados-acesso',
                               'card-services-relatorios']) 


/**
  * Rotas
  */
.config(['$stateProvider','$urlRouterProvider','$locationProvider', '$httpProvider', 
         function($stateProvider,$urlRouterProvider,$locationProvider,$httpProvider) {
    
    // Aceitar "cross" de domínios
    $httpProvider.defaults.useXDomain = true; 
    delete $httpProvider.defaults.headers.common['X-Requested-With'];               
             
    // ROTAS         
    var prefixo = '/';
    
    /* Remover o '#'
    if(window.history && window.history.pushState){ 
        $locationProvider.html5Mode({enabled: true, requireBase: false});
        prefixo = 'app/';
    }*/
    
    $stateProvider

      // ADMINISTRATIVO
    
      .state('administrativo-gestao-acessos-usuarios', {
        url: prefixo + 'administrativo/usuarios',
        templateUrl: 'componentes/administrativo/gestao-acessos/usuarios/index.html',
        controller: "administrativo-usuariosCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      .state('administrativo-gestao-acessos-usuarios-cadastro', {
        title: 'Administrativo',
        url: prefixo + 'administrativo/cadastro-usuarios',
        params: {usuario: null},
        templateUrl: 'componentes/administrativo/gestao-acessos/usuarios/views/cadastro/index.html',
        controller: "administrativo-usuarios-cadastroCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      .state('administrativo-gestao-acessos-privilegios', {
        url: prefixo + 'administrativo/privilegios',
        templateUrl: 'componentes/administrativo/gestao-acessos/privilegios/index.html',
        controller: "administrativo-privilegiosCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      .state('administrativo-gestao-acessos-modulos-funcionalidades', {
        url: prefixo + 'administrativo/modulos-funcionalidades',
        templateUrl: 'componentes/administrativo/gestao-acessos/modulos-funcionalidades/index.html',
        controller: "administrativo-modulos-funcionalidadesCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      .state('administrativo-logs-acesso-usuarios', {
        url: prefixo + 'administrativo/acesso-usuarios',
        templateUrl: 'componentes/administrativo/logs/acesso-usuarios/index.html',
        controller: "administrativo-acesso-usuariosCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      .state('administrativo-gestao-empresas-empresas', {
        url: prefixo + 'administrativo/empresas',
        templateUrl: 'componentes/administrativo/gestao-empresas/empresas/index.html',
        controller: "administrativo-empresasCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      .state('administrativo-gestao-empresas-filiais', {
        url: prefixo + 'administrativo/filiais',
        templateUrl: 'componentes/administrativo/gestao-empresas/filiais/index.html',
        controller: "administrativo-filiaisCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
    
      // DASHBOARD
      .state('dashboard', {
        url: prefixo + 'dashboard',
        templateUrl: 'componentes/dashboard/index.html',
        controller: "dashboardCtrl",
        data: {
            titulo: 'Dashboard'
        }
      })
    
      // CARD SERVICES
      /*.state('card-services', {
        abstract: true
      })*/
    
      .state('card-services-conciliacao-conciliacao-vendas', {
        url: prefixo + 'card-services/conciliacao-vendas',
        templateUrl: 'componentes/card-services/conciliacao/conciliacao-vendas/index.html',
        controller: "card-services-conciliacao-vendasCtrl",
        data: {
            titulo: 'Card Services'
        }
      })
    
      .state('card-services-consolidacao-dados-acesso', {
        url: prefixo + 'card-services/dados-acesso',
        templateUrl: 'componentes/card-services/consolidacao/dados-acesso/index.html',
        controller: "card-services-dados-acessoCtrl",
        data: {
            titulo: 'Card Services'
        }
      }) 
    
      .state('card-services-consolidacao-relatorios', {
        url: prefixo + 'card-services/relatorios',
        templateUrl: 'componentes/card-services/consolidacao/relatorios/index.html',
        controller: "card-services-relatoriosCtrl",
        data: {
            titulo: 'Card Services'
        }
      })    
    
    
      .state('nao-autorizado', {
        url: prefixo + 'nao-autorizado',
        templateUrl: 'componentes/nao-autorizado/index.html',
        controller: "nao-autorizadoCtrl"
      })
    
      .state('nao-encontrado', {
        url: prefixo + 'nao-encontrado',
        templateUrl: 'componentes/nao-encontrado/index.html',
        controller: "nao-encontradoCtrl"
      });       
             
    $urlRouterProvider.otherwise(prefixo + 'nao-encontrado');
    
}])



// CONTROLLER  PAI
.controller("appCtrl", ['$scope',
                        '$rootScope',
                        '$window',
                        '$location',
                        '$state',
                        '$stateParams',
                        '$http',
                        '$timeout',
                        '$modal',
                        '$autenticacao',
                        '$apis',
                        '$webapi',
                        '$empresa',
                        '$campos',
                        '$filter',
                        function($scope,$rootScope,$window,$location,$state,$stateParams,$http,$timeout,$modal,
                                 $autenticacao,$apis,$webapi,$empresa,$campos,$filter){ 
    // Título da página                            
    $scope.pagina = {'titulo': 'Home', 'subtitulo': ''};
    // Usuário
    $scope.token = '';
    $scope.nome_usuario = 'Usuário';
    // Dados da empresa
    $scope.empresa = $empresa;
    // Grupo empresa selecionado
    var empresaId = -1; // se > 0 indica que já estava associado a um grupo empresa
    $scope.grupoempresa = undefined; // grupo empresa em uso
    $scope.gempresa = null;  // objeto que recebe temporariamente o grupo empresa da busca
    // URL da página de login
    var telaLogin = '../';                      
    // Flag
    $scope.exibeLayout = false; // true => carrega layout completo
    var menuConstruido = false;
    $scope.carregandoGrupoEmpresas = false; // indica se está aguardando o objeto com os grupos empresa (para usuário administrativo)
    // Permissões
    $scope.PERMISSAO_ADMINISTRATIVO = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_USUARIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PRIVILEGIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_MODULOS_FUNCIONALIDADES = false; 
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_EMPRESAS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_FILIAIS = false;                       
    $scope.PERMISSAO_ADMINISTRATIVO_LOGS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACESSO_USUARIOS = false;                       
    $scope.PERMISSAO_DASHBOARD = false;
    $scope.PERMISSAO_CARD_SERVICES = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_VENDAS = false;
    $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO = false;
    $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_RELATORIOS = false;                        
    $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_DADOS_ACESSO = false; 
                            
                            
    
    // Fullscreen                                                 
    var removeDivFullscreen = function(){
        if ($('body').hasClass('page-portlet-fullscreen')) $('body').removeClass('page-portlet-fullscreen');
    }   
    
    /**
      * Recarrega completamente a página, reiniciando todos os controllers e serviços
      */
    $scope.reloadPage = function(){
        $window.location.reload();    
    };
                            
                            
    // LINKS
    /**
      * Envia o broadcast para os controllers filhos, notificando a requisição de mudança de estado
      * Isso foi feito visando telas que possuem informações preenchidas pelo usuário e
      * questiona se de fato ele deseja descarta-las antes de prosseguir
      */                         
    $scope.go = function(state, params){
        if(menuConstruido){ 
            removeDivFullscreen();
            if(!$state.current.name) $state.go(state, params); // estado inicial
            else $scope.$broadcast('mudancaDeRota', state, params);
        }
    };
    /**
      * Exibe como conteúdo a Gestão de Acessos Usuários, de Administrativo
      */                     
    $scope.goAdministrativoUsuarios = function(params){
        $scope.go('administrativo-gestao-acessos-usuarios', params); 
    };
    /**
      * Exibe como conteúdo de cadastro de usuário da Gestão de Acessos, de Administrativo
      */                        
    $scope.goAdministrativoUsuariosCadastro = function(params){
        $scope.go('administrativo-gestao-acessos-usuarios-cadastro', params);
    };
    /**
      * Exibe como conteúdo a Gestão de Acessos Privilégios, de Administrativo
      */                        
    $scope.goAdministrativoPrivilegios = function(params){
        $scope.go('administrativo-gestao-acessos-privilegios', params);
    };
    /**
      * Exibe como conteúdo a Gestão de Acessos Módulos e Funcionalidades, de Administrativo
      */                        
    $scope.goAdministrativoModulosFuncionalidades = function(params){
        $scope.go('administrativo-gestao-acessos-modulos-funcionalidades', params);
    }; 
    /**
      * Exibe como conteúdo a Empresas Gestão de Empresas, de Administrativo
      */                        
    $scope.goAdministrativoEmpresas = function(params){
        $scope.go('administrativo-gestao-empresas-empresas', params);
    };
    /**
      * Exibe como conteúdo a Filiais Gestão de Empresas, de Administrativo
      */                        
    $scope.goAdministrativoFiliais = function(params){
        $scope.go('administrativo-gestao-empresas-filiais', params);
    };                       
    /**
      * Exibe como conteúdo a Logs Acesso de Usuários, de Administrativo
      */                        
    $scope.goAdministrativoAcessoUsuarios = function(params){
        $scope.go('administrativo-logs-acesso-usuarios', params);
    };                         
    /**
      * Exibe como conteúdo o Dashboard
      */                        
    $scope.goDashboard = function(params){
        //if(!$state.is('dashboard')) 
            $scope.go('dashboard', params);
        //else console.log("JA ESTÁ NO DASHBOARD");
    };
    /**
      * Exibe como conteúdo a Conciliação Conciliação de Vendas, de Card Services
      */
    $scope.goCardServicesConciliacaoVendas = function(params){
        $scope.go('card-services-conciliacao-conciliacao-vendas', params);
    };
    /**
      * Exibe como conteúdo a Consolidação Dados Acesso, de Card Services
      */
    $scope.goCardServicesDadosAcesso = function(params){
        $scope.go('card-services-consolidacao-dados-acesso', params);
    }; 
    /**
      * Exibe como conteúdo a Consolidação Relatórios, de Card Services
      */
    $scope.goCardServicesRelatorios = function(params){
        $scope.go('card-services-consolidacao-relatorios', params);
    };    
                            
    /** 
      * Valida o acesso a url, considerando as permissões
      */
    $rootScope.$on("$locationChangeStart", function(event, next, current){
        if(current === next){
           event.preventDefault();
           //console.log("LOCATION CHANGE ===");
           return; 
        }
        //console.log("FROM " + current + " TO " + next);
        var url = next.split('#')[1];
        // Avalia
        if(url === $state.get('administrativo-gestao-acessos-usuarios').url || url === $state.get('administrativo-gestao-acessos-usuarios-cadastro').url){ 
            // Gestão de Acesso > Usuários (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_USUARIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            }
        }else if(url === $state.get('administrativo-gestao-acessos-privilegios').url){ 
            // Gestão de Acesso > Usuários (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PRIVILEGIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            } 
        }else if(url === $state.get('administrativo-gestao-acessos-modulos-funcionalidades').url){ 
            // Gestão de Acesso > Usuários (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_MODULOS_FUNCIONALIDADES){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            }  
        }else if(url === $state.get('administrativo-gestao-empresas-empresas').url){ 
            // Gestão de Acesso > Usuários (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_EMPRESAS){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            }  
        }else if(url === $state.get('administrativo-gestao-empresas-filiais').url){ 
            // Gestão de Acesso > Usuários (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_FILIAIS){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            }  
        }else if(url === $state.get('administrativo-logs-acesso-usuarios').url){ 
            // Gestão de Acesso > Usuários (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_LOGS || !$scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACESSO_USUARIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            } 
        }else if(url === $state.get('dashboard').url){ 
            // Dashboard
            if(!$scope.PERMISSAO_DASHBOARD){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            }
        }else if(url === $state.get('card-services-conciliacao-conciliacao-vendas').url){ 
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_VENDAS){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            }
        }else if(url === $state.get('card-services-consolidacao-dados-acesso').url){ 
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_DADOS_ACESSO){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            } 
        }else if(url === $state.get('card-services-consolidacao-relatorios').url){ 
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_RELATORIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.go('nao-autorizado');
            }
        }
        //else event.preventDefault();//console.log("VAI PARA ONDE?");
     });
                            
    /**
      * Retorna para a tela de login
      */
    $scope.voltarTelaLogin = function(){
        $autenticacao.removeDadosDeAutenticacao();
        $window.location.replace(telaLogin);
    };   
    /**
      * Retorna a função que faz o link para o item com o título informado
      */                        
    var getLink = function(titulo){//id_controller){
        switch(titulo.toUpperCase()){//id_controller){
            // Administrativo
            case 'USUÁRIOS' : return $scope.goAdministrativoUsuarios;
            case 'PRIVILÉGIOS' : return $scope.goAdministrativoPrivilegios; 
            case 'MÓDULOS E FUNCIONALIDADES' : return $scope.goAdministrativoModulosFuncionalidades;
            case 'EMPRESAS' : return $scope.goAdministrativoEmpresas;  
            case 'FILIAIS' : return $scope.goAdministrativoFiliais;     
            case 'ACESSO DE USUÁRIOS' : return $scope.goAdministrativoAcessoUsuarios;    
            // Dashboard
            case 'DASHBOARD ATOS': return $scope.goDashboard;  
            // Card Services
            case 'CONCILIAÇÃO DE VENDAS': return $scope.goCardServicesConciliacaoVendas;
            case 'DADOS DE ACESSO': return $scope.goCardServicesDadosAcesso;
            case 'RELATÓRIOS': return $scope.goCardServicesRelatorios; 
            // ...
            default : return null;        
        }
    };
    
    // PERMISSÕES
    /**
      * Atribui a permissão para o respectivo id_controller //título 
      * OBS: título não é uma boa referência. O ideal seria identificadores, 
      * visto que podem existir títulos idênticos em Serviços distintos
      */                         
    var atribuiPermissao = function(titulo){//id_controller){
        switch(titulo.toUpperCase()){//id_controller){
            // Administrativo
            case 'ADMINISTRATIVO' : $scope.PERMISSAO_ADMINISTRATIVO = true; break;
            case 'GESTÃO DE ACESSOS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS = true; break;
            case 'USUÁRIOS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_USUARIOS = true; break;
            case 'PRIVILÉGIOS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PRIVILEGIOS = true; break;
            case 'MÓDULOS E FUNCIONALIDADES' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_MODULOS_FUNCIONALIDADES = true; break;
            case 'GESTÃO DE EMPRESAS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS = true; break;    
            case 'EMPRESAS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_EMPRESAS = true; break; 
            case 'FILIAIS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_FILIAIS = true; break;    
            case 'LOGS' : $scope.PERMISSAO_ADMINISTRATIVO_LOGS = true; break;
            case 'ACESSO DE USUÁRIOS' : $scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACESSO_USUARIOS = true; break;
            // Card Services
            case 'CARD SERVICES': $scope.PERMISSAO_CARD_SERVICES = true; break;
            case 'CONCILIAÇÃO': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO = true; break;
            case 'CONCILIAÇÃO DE VENDAS': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_VENDAS = true; break;
            case 'CONSOLIDAÇÃO': $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO = true; break;   
            case 'DADOS DE ACESSO': $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_DADOS_ACESSO = true; break;    
            case 'RELATÓRIOS': $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_RELATORIOS = true; break;
            // Dashboard
            case 'DASHBOARD ATOS': $scope.PERMISSAO_DASHBOARD = true; break;
            // ...
            default : return ;        
        }
    };
             
    // LAYOUT
    /**
      * Informa se o id_controller informado se refere ao menu que está ativo no momento
      */
    $scope.menuAtivo = function(titulo){//id_controller){
        var state = $state.current.url.split('/')[1]; // nome da pasta inicial da url do estado atual
        switch(titulo.toUpperCase()){//id_controller){
            // Administrativo
            case 'ADMINISTRATIVO' : return state == 'administrativo';
            // Dashboard
            case 'DASHBOARD ATOS': return state == 'dashboard';
            // Card Services
            case 'CARD SERVICES': return state == 'card-services';
                
            default : return false;        
        }
        
    };
    /**
      * Informa se o id_controller informado se refere ao módulo que está ativo no momento
      */
    $scope.moduloAtivo = function(titulo){//id_controller){
        var state = $state.current.url.split('/')[2]; // nome da pasta inicial da url do estado atual
        switch(titulo.toUpperCase()){//id_controller){
            // Administrativo
            case 'USUÁRIOS' : return state == 'usuarios' || state == 'cadastro-usuarios';
            case 'PRIVILÉGIOS' : return state == 'privilegios';
            case 'MÓDULOS E FUNCIONALIDADES' : return state == 'modulos-funcionalidades';
            case 'EMPRESAS' : return state == 'empresas';
            case 'FILIAIS' :  return state == 'filiais';  
            case 'ACESSO DE USUÁRIOS' : return state == 'acesso-usuarios';    
            // Card Services
            case 'CONCILIAÇÃO DE VENDAS': return state == 'conciliacao-vendas';
            case 'DADOS DE ACESSO': return state == 'dados-acesso';
            case 'RELATÓRIOS': return state == 'relatorios'; 
                
            default : return false;        
        }        
    };
    /**
      * A partir do JSON recebido, obtem o JSON menu e as permissões do usuário
      */                        
    var constroiMenu = function(data){
        // Exemplo
        //data.id_grupo = 42;
        /*data.controllers = [
            {
                ds_controller : 'Dashboard Atos',
                id_controller : 64
            },
            {
                ds_controller : 'Card Services',
                id_controller : 59,
                subControllers : [
                    {
                        ds_controller : 'Conciliação',
                        id_controller : 60,
                        subControllers : [
                            {
                                ds_controller : 'Conciliação de Vendas',
                                id_controller : 62
                            }
                        ]
                    },
                    {
                        ds_controller : 'Consolidação',
                        id_controller : 61,
                        subControllers : [
                            {
                                ds_controller : 'Relatórios',
                                id_controller : 63
                            },
                            {
                                ds_controller : 'Dados de Acesso',
                                id_controller : 65
                            }
                        ]
                    }
                ]
            },
            {
                ds_controller : 'Administrativo', // possui perfil administrativo
                id_controller : 52,
                subControllers : [
                    {
                        ds_controller : 'Gestão de Acessos',
                        id_controller : 53,
                        subControllers : [
                            {
                                ds_controller : 'Usuários',
                                id_controller : 54,
								home : true
                            },
                            {
                                ds_controller : 'Privilégios',
                                id_controller : 55
                            },
                            {
                                ds_controller : 'Módulos e Funcionalidades',
                                id_controller : 56
                            }
                        ]
                    },
                    {
                        ds_controller : 'Logs',
                        id_controller : 57,
                        subControllers : [
                            {
                                ds_controller : 'Acesso de usuários',
                                id_controller : 58
                            }
                        ]
                    }
                ]
            }
        ];*/
        
        // Constrói o menu
        $scope.menu = [];
        for(var k = 0; k < data.controllers.length; k++){
            var controller = data.controllers[k];
            var menu = {};
            menu.ds_controller = controller.ds_controller;
            menu.id_controller = controller.id_controller;
            // Atribui permissão
            atribuiPermissao(menu.ds_controller);//menu.id_controller);
            // A priori não tem premissão
            menu.temLink = false;
            
            // Subserviços
            if(controller.subControllers  && controller.subControllers.length > 0){
                menu.subControllers = [];
                for(var j = 0; j < controller.subControllers.length; j++){
                    var subController1 = controller.subControllers[j];
                    var subMenu = {};
                    subMenu.ds_controller = subController1.ds_controller;
                    subMenu.id_controller = subController1.id_controller;
                    // Atribui permissão
                    atribuiPermissao(subMenu.ds_controller);//subMenu.id_controller);
                    // A priori não tem premissão
                    subMenu.temLink = false;
                    
                    // Módulos
                    if(subController1.subControllers && subController1.subControllers.length > 0){
                        subMenu.subControllers = [];
                        for(var i = 0; i < subController1.subControllers.length; i++){
                            var subController2 = subController1.subControllers[i];
                            var itemMenu = {};
                            itemMenu.ds_controller = subController2.ds_controller;
                            itemMenu.id_controller = subController2.id_controller;
                            // Atribui permissão
                            atribuiPermissao(itemMenu.ds_controller);//itemMenu.id_controller);
                            // A priori não tem premissão
                            itemMenu.temLink = false;
                            
                            itemMenu.link = getLink(itemMenu.ds_controller);//itemMenu.id_controller);
                            if(itemMenu.link === null) itemMenu.link = function(){};
                            else itemMenu.temLink = subMenu.temLink = menu.temLink = true;
                            if(subController2.home && !$scope.goHome) $scope.goHome = itemMenu.link;
                            // Adiciona o módulo
                            subMenu.subControllers.push(itemMenu);
                        }
                    }else{
                        // Se não tem módulos, então deve ter um link
                        subMenu.link = getLink(subMenu.ds_controller);//subMenu.id_controller); 
                        if(subMenu.link === null) subMenu.link = function(){};
                        else subMenu.temLink = menu.temLink = true;
                        // Página inicial é definido pelo primeiro 'home=true' encontrado        
                        if(subController1.home && !$scope.goHome) $scope.goHome = subMenu.link;
                    }
                    
                    // Adiciona o subserviço
                    menu.subControllers.push(subMenu);
                }
            }else{
                // Se não tem subserviços, então deve ter um link
                menu.link = getLink(menu.ds_controller);//menu.id_controller); 
                if(menu.link === null) menu.link = function(){};
                else menu.temLink = true;
                // Página inicial é definido pelo primeiro 'home=true' encontrado        
                if(controller.home && !$scope.goHome) $scope.goHome = menu.link;
            }
            
            // Adiciona o menu
            $scope.menu.push(menu);
        }
        
        // Verifica se estava administrando algum grupo empresa
        //if(data.id_grupo) empresaId = servico.id_grupo;
        if($scope.PERMISSAO_ADMINISTRATIVO && data.id_grupo) obtemGrupoEmpresa(data.id_grupo);
        
        // Go Home
        //if(typeof $scope.goHome == 'function') $scope.goHome();
        
        // Seta o flag para true
        menuConstruido = true;
    };
    /**
      * Exibe o layout e inicializa seus handlers
      */
    var exibeLayout = function(){
        // Inicializa todos os handlers de layout 
        angular.element(document).ready(function(){ // SÓ chama um vez
        //$scope.$on('$viewContentLoaded', function() { // chama duas vezes. why??
           //console.log("CONTENT LOADED");
           $scope.exibeLayout = true;  // só exibe após carregamento completo da página    
           Metronic.init(); // init metronic core componets
           Layout.init(); // init layout  
        });
    };
                            
    /**
      * Redireciona página
      */
    var exibePaginaAtual = function(){
        // Direciona para a página
        switch($location.path()){
            case $state.get('dashboard').url : 
                $scope.goDashboard(); break;
            case $state.get('administrativo-gestao-acessos-usuarios').url : 
                 $scope.goAdministrativoUsuarios(); break;
            case $state.get('administrativo-gestao-acessos-usuarios-cadastro').url : 
                $scope.goAdministrativoUsuariosCadastro(); break;
            case $state.get('administrativo-gestao-acessos-privilegios').url : 
                 $scope.goAdministrativoPrivilegios(); break;    
            case $state.get('administrativo-gestao-acessos-modulos-funcionalidades').url : 
                 $scope.goAdministrativoModulosFuncionalidades(); break; 
            case $state.get('administrativo-gestao-empresas-empresas').url : 
                 $scope.goAdministrativoEmpresas(); break;   
            case $state.get('administrativo-gestao-empresas-filiais').url : 
                 $scope.goAdministrativoFiliais(); break;     
            case $state.get('administrativo-logs-acesso-usuarios').url :
                 $scope.goAdministrativoAcessoUsuarios(); break;
            case $state.get('card-services-conciliacao-conciliacao-vendas').url : 
                $scope.goCardServicesConciliacaoVendas(); break;
            case $state.get('card-services-consolidacao-dados-acesso').url : 
                $scope.goCardServicesDadosAcesso(); break;     
            case $state.get('card-services-consolidacao-relatorios').url : 
                $scope.goCardServicesRelatorios(); break;
            default : if(typeof $scope.goHome == 'function') $scope.goHome(); // Exibe tela inicial
        }
    };                        
    
    
    /**
      * INICIALIZAÇÃO DO CONTROLLER
      */                        
    $scope.init = function(){       
        // Verifica se está autenticado
        if(!$autenticacao.usuarioEstaAutenticado()){ 
            $scope.voltarTelaLogin();
            return;
        }
        // Obtém o token
        $scope.token = $autenticacao.getToken();
        if(!$scope.token){ 
            $autenticacao.removeDadosDeAutenticacao();
            $scope.voltarTelaLogin(); // what?! FATAL ERROR!
            return;
        }
        
        // Exibe o layout
        exibeLayout();
        // Exibe um loading que bloqueia a página toda
        $scope.showProgress();
        
        // Avalia Token
        $webapi.get($apis.getUrl($autenticacao.autenticacao.login, $scope.token))
        // Verifica se a requisição foi respondida com sucesso
            .then(function(dados){
                // Nome do usuário
                $scope.nome_usuario = dados.nome;
                // Atualiza token na local storage
                $scope.token = dados.token;
                $autenticacao.atualizaToken($scope.token);
                // Controi menu e obtem as permissões do usuário
                constroiMenu(dados);
                // Exibe a página atual
                exibePaginaAtual();
                // Atualiza último datetime de autenticação
                $autenticacao.atualizaDateTimeDeAutenticacao(new Date());
                // Remove o loading da página
                $scope.hideProgress();
            },
            function(failData){
              // Avaliar código de erro
              if(failData.status === 500)
                  // Código 500 => Token já não é mais válido
                  $scope.voltarTelaLogin();
              else{ 
                  console.log("FALHA AO VALIDAR TOKEN: " + failData.status);
                  // o que fazer? exibir uma tela indicando falha de comunicação?
                  // Status 0: sem resposta
              }
              // Remove o loading da página
              $scope.hideProgress();
            });
    };
                            
    // GRUPO EMPRESA
                            
    /**
      * Reporta se está em progresso de autenticação
      */
    var progressoGrupoEmpresas = function(emProgresso){
        $scope.carregandoGrupoEmpresas = emProgresso;
        if(!$scope.$$phase) $scope.$apply();
    };
    /**
      * Obtém um único grupo empresa, a partir do empresaId
      */
    var obtemGrupoEmpresa = function(empresaId){
         // Obtém os dados da empresa
         progressoGrupoEmpresas(true);
         // Obtém a URL                                                      
         $webapi.get($apis.cliente.grupoempresa, [$scope.token, 0], {id:$campos.cliente.grupoempresa.id_grupo, valor: empresaId})
            .then(function(dados){  
                $scope.grupoempresa = dados.Registros[0];
                $scope.$broadcast("alterouGrupoEmpresa");
                progressoGrupoEmpresas(false);
             },
             function(failData){
                if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                else $scope.showAlert('Houve uma falha ao se associar ao grupo empresa (' + failData.status + ')', true, 'danger', true);
                progressoGrupoEmpresas(false);
             });    
    };
    /** 
      *  Requisita a lista filtrada dos grupo empresas registrados no servidor   
      */
    $scope.buscaGrupoEmpresas = function(texto){
       progressoGrupoEmpresas(true);
       // Obtém a URL                                                      
       var url = $apis.getUrl($apis.cliente.grupoempresa, 
                              [$scope.token, 0, $campos.cliente.grupoempresa.ds_nome, 0, 10, 1], // ordenado crescente com 10 itens no máximo
                              {id:$campos.cliente.grupoempresa.ds_nome, valor: texto + '%'});
       // Requisita e obtém os dados
       return $http.get(url).then(function(dados){
           progressoGrupoEmpresas(false);
           return dados.data.Registros;
        },function(failData){
             console.log("FALHA AO OBTER GRUPOS EMPRESA FILTRADOS: " + failData.status);
             progressoGrupoEmpresas(false);
             return [];
          });
    };                   
    /** 
      * Seleciona Grupo Empresa
      */
    $scope.selecionaGrupoEmpresa = function(grupoempresa){
        $scope.grupoempresa = grupoempresa;
        $scope.gempresa = null; 
        // Remove da visão a tela de busca do grupo empresa
        $('#admBuscaGrupoEmpresa').parent().removeClass('open');
        // Notifica
        $scope.$broadcast("alterouGrupoEmpresa"); //*/
        //associaUsuarioAGrupoEmpresa(grupoempresa.id_grupo, function(dados){ $scope.grupoempresa = grupoempresa; });
    };
    /** 
      * Limpar Grupo Empresa
      */
    $scope.limpaGrupoEmpresa = function(){
        $scope.grupoempresa = undefined;
        $scope.gempresa = null; 
        $scope.$broadcast("alterouGrupoEmpresa");
        // Dessassocia (id_grupo = -1) //*/
        //associaUsuarioAGrupoEmpresa(-1, function(dados){ $scope.grupoempresa = undefined; });
    };
    var associaUsuarioAGrupoEmpresa = function(id_grupo, funcaoSucesso){
        //console.log(id_grupo);
        // Envia 
        $scope.showProgress();
        $webapi.update($apis.getUrl($apis.administracao.webpagesusers, undefined, 
                                    {id:'token', valor: $scope.token}), {id_grupo : id_grupo})
            .then(function(dados){  
                if(typeof funcaoSucesso === 'function') funcaoSucesso(dados);
                // Reinicia o valor do model
                $scope.gempresa = null; 
                // Remove da visão a tela de busca do grupo empresa
                $('#admBuscaGrupoEmpresa').parent().removeClass('open');
                // Notifica
                $scope.$broadcast("alterouGrupoEmpresa");
                // Remove o progress
                $scope.hideProgress();
             },
             function(failData){
                if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                else $scope.showAlert('Houve uma falha ao se associar ao grupo empresa (' + failData.status + ')', true, 'danger', true);
                // Reinicia o valor do model
                $scope.gempresa = null; 
                // Remove o progress
                $scope.hideProgress();
             });         
    };
                            
                            
             
                            
                            
                            
   // Extras                       
                            
   // Exibe o alert
   var alertId = '';
   /**
     * Exibe um alert no container
     * @param mensagem : texto a ser exibido. Default: 'Por favor, aguarde'
     * @param closable : set true se deseja que apareça um botão que fecha manualmente o alert. Default: false
     * @param type : 'info' (default), 'success', 'danger', 'warning'.
     * @param scroll : set true se deseja que, ao ser exibido, a barra de rolagem rolará até ele. Default: false
     */
   $scope.showAlert = function(mensagem, closable, type, scroll){
        jQuery(document).ready(function() { 
        //$rootScope.$on('$viewContentLoaded', function(){
           $timeout(function(){
                   alertId = Metronic.alert({
                    container: '', // alerts parent container(by default placed after the page breadcrumbs)
                    place: 'append', // append or prepent in container 
                    type: type ? type : 'info',  // alert's type
                    message: mensagem ? mensagem : 'Por favor, aguarde',  // alert's message
                    close: closable ? true : false, // make alert closable
                    reset: true, // close all previouse alerts first
                    focus: scroll ? true : false, // auto scroll to the alert after shown
                    closeInSeconds: type !== 'info' ? 10 : 0, // auto close after defined seconds
                    icon: type === 'danger' || type === 'warning' ? 'warning' : type === 'success' ? 'check' : '', // put icon before the message
                    img : !type || type === 'info' ? '/img/loading-atos.gif' : '' // put img before the message
                });
            }, 0);
        }); 
   };
   // Esconde o alert
   $scope.hideAlert = function(){
       $timeout(function(){$('#' + alertId).remove();}, 0); // fecha alert
   };
                            
                            
   // MODAL
   $scope.modal_titulo = 'Titulo';
   $scope.modal_mensagem = 'Mensagem';
   $scope.modal_textoConfirma = 'Ok';
   $scope.modal_textoCancela = 'Cancelar';
   /**
     * Exibe o modal de confirmação
     * @param titulo : título 
     * @param mensagem : corpo
     * @param funcaoConfirma : funcao que será invocada quando o botão confirma for pressionado
     * @param parametroFuncaoConfirma : objeto passado como parâmetro da função confirma
     * @param textoConfirma : texto exibido no botão de confirmação
     * @param textoCancela : texto exibido no botão que cancela o modal
     */
   $scope.showModalConfirmacao = function(titulo, mensagem, funcaoConfirma, parametroFuncaoConfirma, textoConfirma, textoCancela){
      // Seta os valores
      $scope.modal_titulo = titulo ? titulo : 'Atos Capital';
      $scope.modal_mensagem = mensagem ? mensagem : '';
      $scope.modal_textoConfirma = textoConfirma ? textoConfirma : 'Ok';
      $scope.modal_textoCancela = textoCancela ? textoCancela : 'Cancelar';
      $scope.modal_confirma = funcaoConfirma ? function(){funcaoConfirma(parametroFuncaoConfirma);} : function(){};   
      // Exibe o modal
      $('#modalConfirmacao').modal('show');
      if(!$scope.$$phase) $scope.$apply();   
   };  
                            
                            
   // MODAL ALERTA
    $scope.alerta = {titulo : '', mensagem : '', textoOk : 'Ok', funcaoOk: function(){}};                                       
    /**
      * Exibe modal com a mensagem de alerta
      */
    $scope.showModalAlerta = function(mensagem, titulo, textoOk, funcaoOk){
        $scope.alerta.titulo = titulo ? titulo : 'Info';
        $scope.alerta.mensagem = mensagem ? mensagem : 'Mensagem';
        $scope.alerta.textoOk = textoOk ? textoOk : 'Ok';
        $scope.alerta.funcaoOk = typeof funcaoOk === 'function' ? funcaoOk : function(){fechaModalAlerta()};
        // Exibe o modal
        $('#modalAlerta').modal('show');
        if(!$scope.$$phase) $scope.$apply();
    }
    var fechaModalAlerta = function(){
        $('#modalAlerta').modal('hide');    
    }; 
                            
    // MODAL INPUT
    $scope.input = {titulo : '', mensagem : '', text : '', textoCancela : 'Cancelar',
                    textoConfirma : 'Ok', funcaoConfirma : function(text){},
                    showCheckbox : false, checkboxText : '', checkbox : false, funcaoCheckboxChange : function(checked){}};                                       
    /**
      * Exibe modal com o input
      */
    $scope.showModalInput = function(mensagem, titulo, textoCancela, textoConfirma, funcaoConfirma, textInit, 
                                     showCheckbox, checkboxText, checked, funcaoCheckboxChange){
        $scope.input.mensagem = mensagem ? mensagem : 'Mensagem';
        $scope.input.titulo = titulo ? titulo : 'Info';
        $scope.input.textoCancela = textoCancela ? textoCancela : 'Cancelar';
        $scope.input.textoConfirma = textoConfirma ? textoConfirma : 'Ok';
        $scope.input.funcaoConfirma = typeof funcaoConfirma === 'function' ? funcaoConfirma : function(text){fechaModalInput()};
        $scope.input.text = textInit ? textInit : '';
        $scope.input.showCheckbox = showCheckbox ? true : false;
        $scope.input.checkboxText = checkboxText ? checkboxText : '';
        $scope.input.checkbox = checked ? true : false;
        $scope.input.funcaoCheckboxChange = typeof funcaoCheckboxChange === 'function' ? funcaoCheckboxChange : function(checked){};
        // Exibe o modal
        $('#modalInput').modal('show');
        if(!$scope.$$phase) $scope.$apply();
    }
    $scope.fechaModalInput = function(){
        $('#modalInput').modal('hide');    
    };                        
                            
                            
                            
   // PROGRESS                        
   /**
     * Obtém a div para exibir o loading progress
     */
   var getElementProgress = function(divPortletBodyPos){
        if(typeof divPortletBodyPos !== 'number') return undefined;
        var div = $('div[class="portlet light"]');
        if(div.length == 0){ 
            // Verifica se está em full screen
            div = $('div[class="portlet light portlet-fullscreen"]');
            if(div.length == 0) return undefined; 
        }
        var body = div.children(".portlet-body");
        if(divPortletBodyPos < 0 || divPortletBodyPos >= body.length) return undefined;
        return body[divPortletBodyPos]; 
   }
   /**
     * Exibe o loading progress no portlet-body
     */
   $scope.showProgress = function(divPortletBodyPos){
        var el = getElementProgress(divPortletBodyPos);
        Metronic.blockUI({
            target: el,
            animate: true,
            overlayColor: '#000'//'none'
        }); 
   };
   /**
     * Remove da visão o loading progress no portlet-body
     */                         
   $scope.hideProgress = function(divPortletBodyPos){
        var el = getElementProgress(divPortletBodyPos);
        Metronic.unblockUI(el);
   };                            
                            
}])



// Init global settings and run the app
.run(['$rootScope', '$location', function($rootScope, $location) {
    // Título da página
    $rootScope.$on('$stateChangeSuccess', function (event, current, previous) {
        if(current.data) $rootScope.titulo = current.data.titulo;
    });
}]);