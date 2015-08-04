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
                               'administrativo-acoes-usuarios',
                               'administrativo-empresas',
                               'administrativo-filiais',
                               'administrativo-filiais-cadastro',
                               'dashboard', 
                               'card-services-cash-flow-relatorios',
                               'card-services-conciliacao-vendas',
                               'card-services-dados-acesso',
                               'card-services-consolidacao-relatorios',
                               'card-services-senhas-invalidas',
                               'conta',
                               'conta-alterar-senha',
                               'usuario-sem-link']) 


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
    
      .state('administrativo-logs-acoes-usuarios', {
        url: prefixo + 'administrativo/acoes-usuarios',
        templateUrl: 'componentes/administrativo/logs/acoes-usuarios/index.html',
        controller: "administrativo-acoes-usuariosCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      .state('administrativo-gestao-acessos-usuarios-cadastro', {
        url: prefixo + 'administrativo/cadastro-usuarios',
        params: {usuario: null},
        templateUrl: 'componentes/administrativo/gestao-acessos/usuarios/views/cadastro/index.html',
        controller: "administrativo-usuarios-cadastroCtrl",
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
    
      .state('administrativo-gestao-empresas-filiais-cadastro', {
        url: prefixo + 'administrativo/cadastro-filiais',
        params: {filial: null},
        templateUrl: 'componentes/administrativo/gestao-empresas/filiais/views/cadastro/index.html',
        controller: "administrativo-filiais-cadastroCtrl",
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
      .state('card-services-cash-flow-relatorios', {
        url: prefixo + 'card-services/cash-flow-relatorios',
        templateUrl: 'componentes/card-services/cash-flow/relatorios/index.html',
        controller: "card-services-cash-flow-relatoriosCtrl",
        data: {
            titulo: 'Card Services'
        }
      })
    
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
        url: prefixo + 'card-services/consolidacao-relatorios',
        templateUrl: 'componentes/card-services/consolidacao/relatorios/index.html',
        controller: "card-services-consolidacao-relatoriosCtrl",
        data: {
            titulo: 'Card Services'
        }
      })
    
      .state('card-services-consolidacao-senhas-invalidas', {
        url: prefixo + 'card-services/senhas-invalidas',
        templateUrl: 'componentes/card-services/consolidacao/senhas-invalidas/index.html',
        controller: "card-services-senhas-invalidasCtrl",
        data: {
            titulo: 'Card Services'
        }
      })
    
    
      // CONTA
      .state('minha-conta', {
        url: prefixo + 'minha-conta',
        templateUrl: 'componentes/conta/index.html',
        controller: "contaCtrl",
        data: {
            titulo: 'Minha Conta'
        }
      }) 
    
      .state('minha-conta-alterar-senha', {
        url: prefixo + 'minha-conta/alterar-senha',
        templateUrl: 'componentes/conta/views/alterar-senha/index.html',
        controller: "conta-alterar-senhaCtrl",
        data: {
            titulo: 'Minha Conta'
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
      })
             
      .state('usuario-sem-link', {
        url: prefixo + 'sem-acesso',
        templateUrl: 'componentes/usuario-sem-link/index.html',
        controller: "usuario-sem-linkCtrl"
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
                        function($scope,$rootScope,$window,$location,$state,$stateParams,$http,$timeout,$modal,
                                 $autenticacao,$apis,$webapi,$empresa,$campos){ 
    // Título da página                            
    $scope.pagina = {'titulo': 'Home', 'subtitulo': ''};
    // Usuário
    $scope.token = '';
    $scope.nome_usuario = 'Usuário';
    // Dados da empresa
    $scope.empresa = $empresa;
    // Grupo empresa selecionado
    var empresaId = -1; // se > 0 indica que já estava associado a um grupo empresa
    $scope.usuariologado = { grupoempresa : undefined, empresa : undefined } ; // grupo empresa em uso
    $scope.gempresa = null;  // objeto que recebe temporariamente o grupo empresa da busca
    // Controller selecionado
    $scope.methodsDoControllerCorrente = []; 
    var controllerAtual = undefined;
    // URL da página de login
    var telaLogin = '../';   
    // Menu                             
    $scope.menu = [];
    var controllerHome = undefined;  // página inicial                        
    $scope.itensMenuLink = [];                        
    $scope.buscaItemLink = undefined;                     
    // Flag
    $scope.exibeLayout = false; // true => carrega layout completo
    $scope.menuConstruido = false;
    $scope.carregandoGrupoEmpresas = false; // indica se está aguardando o objeto com os grupos empresa (para usuário administrativo)
    // Controllers
    var controllerAdministrativoUsuarios = undefined;
    //var controllerAdministrativoUsuariosCadastro = undefined;
    var controllerAdministrativoPrivilegios = undefined;
    var controllerAdministrativoModulosFuncionalidades = undefined;
    var controllerAdministrativoEmpresas = undefined;
    var controllerAdministrativoFiliais = undefined;
    //var controllerAdministrativoFiliaisCadastro = undefined;
    var controllerAdministrativoAcessoUsuarios = undefined;
    var controllerAdministrativoAcoesUsuarios = undefined;
    var controllerDashboard = undefined;
    var controllerCardServicesCashFlowRelatorios = undefined;
    var controllerCardServicesConciliacaoVendas = undefined;
    var controllerCardServicesDadosAcesso = undefined;
    var controllerCardServicesSenhasInvalidas = undefined;
    var controllerCardServicesConsolidacaoRelatorios = undefined;
    // Permissões
    //$scope.usuarioTemAcesso = false;                      
    $scope.PERMISSAO_FILTRO_EMPRESA = false;                        
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
    $scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACOES_USUARIOS = false;                           
    $scope.PERMISSAO_DASHBOARD = false;
    $scope.PERMISSAO_CARD_SERVICES = false;
    $scope.PERMISSAO_CARD_SERVICES_CASH_FLOW = false;   
    $scope.PERMISSAO_CARD_SERVICES_CASH_FLOW_RELATORIOS = false;                        
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_VENDAS = false;
    $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO = false;
    $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_RELATORIOS = false;                        
    $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_DADOS_ACESSO = false; 
    $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_SENHAS_INVALIDAS = false;                         
                            
                            
    
    // Fullscreen 
    var estaEmFullScreen = false;
    $scope.fullScreenClick = function(){
        // Espera o efeito de add ou remove do fullscreen acontecer
        $timeout(function(){estaEmFullScreen = $('body').hasClass('page-portlet-fullscreen')}, 500); 
    };
    $scope.telaEstaEmFullScreen = function(){
        return estaEmFullScreen;    
    }
    var removeDivFullscreen = function(){
        if($scope.telaEstaEmFullScreen()){ 
            $('body').removeClass('page-portlet-fullscreen');
            estaEmFullScreen = false;
        }
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
    var go = function(state, params){
        if($scope.menuConstruido){ 
            removeDivFullscreen();
            if(!$state.current.name) $state.go(state, params); // estado inicial
            else $scope.$broadcast('mudancaDeRota', state, params);
        }
    };
    /**
      * Acessa o link relacionado ao controller
      */                         
    $scope.goLinkController = function(controller){
        if(!controller) return;
        //controllerAtual = controller;
        $scope.methodsDoControllerCorrente = controller.methods;
        //console.log(controller);
        //console.log($scope.methodsDoControllerCorrente);
        controller.link();
    };
    /**
      * Acessa a página inicial
      */                         
    $scope.goHome = function(){
        $scope.goLinkController(controllerHome);    
    };
    /**
      * Exibe como conteúdo a Gestão de Acessos Usuários, de Administrativo
      */                     
    $scope.goAdministrativoUsuarios = function(params){
        controllerAtual = controllerAdministrativoUsuarios;
        go('administrativo-gestao-acessos-usuarios', params); 
    };
    /**
      * Exibe como conteúdo de cadastro de usuário da Gestão de Acessos, de Administrativo
      */                        
    $scope.goAdministrativoUsuariosCadastro = function(params){
        controllerAtual = controllerAdministrativoUsuarios;//Cadastro;
        go('administrativo-gestao-acessos-usuarios-cadastro', params);
    };
    /**
      * Exibe como conteúdo a Gestão de Acessos Privilégios, de Administrativo
      */                        
    $scope.goAdministrativoPrivilegios = function(params){
        controllerAtual = controllerAdministrativoPrivilegios;
        go('administrativo-gestao-acessos-privilegios', params);
    };
    /**
      * Exibe como conteúdo a Gestão de Acessos Módulos e Funcionalidades, de Administrativo
      */                        
    $scope.goAdministrativoModulosFuncionalidades = function(params){
        controllerAtual = controllerAdministrativoModulosFuncionalidades;
        go('administrativo-gestao-acessos-modulos-funcionalidades', params);
    }; 
    /**
      * Exibe como conteúdo a Empresas Gestão de Empresas, de Administrativo
      */                        
    $scope.goAdministrativoEmpresas = function(params){
        controllerAtual = controllerAdministrativoEmpresas;
        go('administrativo-gestao-empresas-empresas', params);
    };                    
    /**
      * Exibe como conteúdo a Filiais Gestão de Empresas, de Administrativo
      */                        
    $scope.goAdministrativoFiliais = function(params){
        controllerAtual = controllerAdministrativoFiliais;
        go('administrativo-gestao-empresas-filiais', params);
    };  
    /**
      * Exibe como conteúdo de cadastro de Filiais Gestão de Empresas, de Administrativo
      */                        
    $scope.goAdministrativoFiliaisCadastro = function(params){
        controllerAtual = controllerAdministrativoFiliais;//Cadastro;
        go('administrativo-gestao-empresas-filiais-cadastro', params);
    };                           
    /**
      * Exibe como conteúdo a Logs Acesso de Usuários, de Administrativo
      */                        
    $scope.goAdministrativoAcessoUsuarios = function(params){
        controllerAtual = controllerAdministrativoAcessoUsuarios;
        go('administrativo-logs-acesso-usuarios', params);
    };
    /**
      * Exibe como conteúdo a Logs Ações de Usuários, de Administrativo
      */                        
    $scope.goAdministrativoAcoesUsuarios = function(params){
        controllerAtual = controllerAdministrativoAcoesUsuarios;
        go('administrativo-logs-acoes-usuarios', params);
    };                         
    /**
      * Exibe como conteúdo o Dashboard
      */                        
    $scope.goDashboard = function(params){
        controllerAtual = controllerDashboard;
        go('dashboard', params);
    };
    /**
      * Exibe como conteúdo a Cash Flow Relatórios, de Card Services
      */
    $scope.goCardServicesCashFlowRelatorios = function(params){
        controllerAtual = controllerCardServicesCashFlowRelatorios;
        go('card-services-cash-flow-relatorios', params);
    };                         
    /**
      * Exibe como conteúdo a Conciliação Conciliação de Vendas, de Card Services
      */
    $scope.goCardServicesConciliacaoVendas = function(params){
        controllerAtual = controllerCardServicesConciliacaoVendas;
        go('card-services-conciliacao-conciliacao-vendas', params);
    };
    /**
      * Exibe como conteúdo a Consolidação Dados Acesso, de Card Services
      */
    $scope.goCardServicesDadosAcesso = function(params){
        controllerAtual = controllerCardServicesDadosAcesso;
        go('card-services-consolidacao-dados-acesso', params);
    }; 
    /**
      * Exibe como conteúdo a Consolidação Relatórios, de Card Services
      */
    $scope.goCardServicesConsolidacaoRelatorios = function(params){
        controllerAtual = controllerCardServicesConsolidacaoRelatorios;
        go('card-services-consolidacao-relatorios', params);
    }; 
    /**
      * Exibe como conteúdo a Consolidação Senhas Inválidas, de Card Services
      */
    $scope.goCardServicesSenhasInvalidas = function(params){
        controllerAtual = controllerCardServicesSenhasInvalidas;
        go('card-services-consolidacao-senhas-invalidas', params);
    };                         
    /**
      * Exibe a tela de perfil de conta
      */
    $scope.goMinhaConta = function(params){
        controllerAtual = undefined;
        go('minha-conta', params);    
    };
    /**
      * Exibe a tela para alterar a senha do usuário
      */
    $scope.goMinhaContaAlterarSenha = function(params){
        controllerAtual = undefined;
        go('minha-conta-alterar-senha', params);    
    }; 
    /**
      * Exibe que a tela informando que o usuário não possui privilégios
      */
    $scope.goUsuarioSemPrivilegios = function(params){
        controllerAtual = undefined;
        go('nao-autorizado', params);
    };                        
    /**
      * Exibe que a tela informando que o usuário não possui acesso
      */
    $scope.goUsuarioSemLinks = function(params){
        controllerAtual = undefined;
        go('usuario-sem-link', params);
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
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'USUÁRIOS')
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
            
        }else if(url === $state.get('administrativo-gestao-acessos-privilegios').url){ 
            // Gestão de Acesso > Privilégios
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PRIVILEGIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'PRIVILÉGIOS')
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual 
        }else if(url === $state.get('administrativo-gestao-acessos-modulos-funcionalidades').url){ 
            // Gestão de Acesso > Módulos e Funcionalidades
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_MODULOS_FUNCIONALIDADES){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'MÓDULOS E FUNCIONALIDADES')
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual   
        }else if(url === $state.get('administrativo-gestao-empresas-empresas').url){ 
            // Gestão de Empresas > Empresas
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_EMPRESAS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'EMPRESAS')
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual   
        }else if(url === $state.get('administrativo-gestao-empresas-filiais').url || url === $state.get('administrativo-gestao-empresas-filiais-cadastro').url){ 
            // Gestão de Empresas > Filiais (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_FILIAIS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'FILIAIS')
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual   
        }else if(url === $state.get('administrativo-logs-acesso-usuarios').url){ 
            // Logs > Acesso de usuários
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_LOGS || !$scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACESSO_USUARIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'ACESSO DE USUÁRIOS')
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual 
        }else if(url === $state.get('administrativo-logs-acoes-usuarios').url){ 
            // Logs > Ações de usuários
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_LOGS || !$scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACOES_USUARIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'AÇÕES DE USUÁRIOS')
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual 
        }else if(url === $state.get('dashboard').url){ 
            // Dashboard
            if(!$scope.PERMISSAO_DASHBOARD){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'DASHBOARD ATOS')
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual 
        }else if(url === $state.get('card-services-cash-flow-relatorios').url){ 
            // Card Services > Cash Flow > Relatórios
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CASH_FLOW || !$scope.PERMISSAO_CARD_SERVICES_CASH_FLOW_RELATORIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'RELATÓRIOS') // problem!
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual 
        }else if(url === $state.get('card-services-conciliacao-conciliacao-vendas').url){ 
            // Card Services > Conciliação > Conciliação de Vendas
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_VENDAS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'CONCILIAÇÃO DE VENDAS') 
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual 
        }else if(url === $state.get('card-services-consolidacao-dados-acesso').url){ 
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_DADOS_ACESSO){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'DADOS DE ACESSO')
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual  
        }else if(url === $state.get('card-services-consolidacao-relatorios').url){ 
            // Card Services > Consolidação > Relatórios
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_RELATORIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'RELATÓRIOS') // problem!
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('card-services-consolidacao-senhas-invalidas').url){ 
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_SENHAS_INVALIDAS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || controllerAtual.ds_controller.toUpperCase() !== 'SENHAS INVÁLIDAS')
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual  
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
      * e já atualiza o controllerAtual
      */                        
    var getLink = function(controller, controllerpai){
        switch(controller.ds_controller.toUpperCase()){
            // Administrativo
            case 'USUÁRIOS' : 
                if($location.path() === $state.get('administrativo-gestao-acessos-usuarios').url ||
                   $location.path() === $state.get('administrativo-gestao-acessos-usuarios-cadastro').url) 
                    controllerAtual = controller;
                controllerAdministrativoUsuarios = controller;
                return $scope.goAdministrativoUsuarios;
            case 'PRIVILÉGIOS' : 
                if($location.path() === $state.get('administrativo-gestao-acessos-privilegios').url) 
                    controllerAtual = controller;
                controllerAdministrativoPrivilegios = controller;
                return $scope.goAdministrativoPrivilegios; 
            case 'MÓDULOS E FUNCIONALIDADES' :
                if($location.path() === $state.get('administrativo-gestao-acessos-modulos-funcionalidades').url) 
                    controllerAtual = controller;
                controllerAdministrativoModulosFuncionalidades = controller;
                return $scope.goAdministrativoModulosFuncionalidades;
            case 'EMPRESAS' : 
                if($location.path() === $state.get('administrativo-gestao-empresas-empresas').url) 
                    controllerAtual = controller;
                controllerAdministrativoEmpresas = controller;
                return $scope.goAdministrativoEmpresas;  
            case 'FILIAIS' : 
                if($location.path() === $state.get('administrativo-gestao-empresas-filiais').url || 
                   $location.path() === $state.get('administrativo-gestao-empresas-filiais-cadastro').url) 
                    controllerAtual = controller;
                controllerAdministrativoFiliais = controller;
                return $scope.goAdministrativoFiliais;     
            case 'ACESSO DE USUÁRIOS' : 
                if($location.path() === $state.get('administrativo-logs-acesso-usuarios').url) 
                    controllerAtual = controller;
                controllerAdministrativoAcessoUsuarios = controller;
                return $scope.goAdministrativoAcessoUsuarios; 
            case 'AÇÕES DE USUÁRIOS':
                if($location.path() === $state.get('administrativo-logs-acoes-usuarios').url) 
                    controllerAtual = controller;
                controllerAdministrativoAcoesUsuarios = controller;
                return $scope.goAdministrativoAcoesUsuarios;
            // Dashboard
            case 'DASHBOARD ATOS': 
                if($location.path() === $state.get('dashboard').url) controllerAtual = controller;
                controllerDashboard = controller;
                return $scope.goDashboard;  
            // Card Services
            case 'CONCILIAÇÃO DE VENDAS': 
                if($location.path() === $state.get('card-services-conciliacao-conciliacao-vendas').url) 
                    controllerAtual = controller;
                controllerCardServicesConciliacaoVendas = controller;
                return $scope.goCardServicesConciliacaoVendas;
            case 'DADOS DE ACESSO': 
                if($location.path() === $state.get('card-services-consolidacao-dados-acesso').url) 
                    controllerAtual = controller;
                controllerCardServicesDadosAcesso = controller;
                return $scope.goCardServicesDadosAcesso;
            case 'SENHAS INVÁLIDAS':
                 if($location.path() === $state.get('card-services-consolidacao-senhas-invalidas').url) 
                    controllerAtual = controller;
                controllerCardServicesSenhasInvalidas = controller;
                return $scope.goCardServicesSenhasInvalidas;
                
            // AMBÍGUOS    
            case 'RELATÓRIOS': 
                if(controllerpai.ds_controller.toUpperCase() === 'CASH FLOW'){
                    if($location.path() === $state.get('card-services-cash-flow-relatorios').url) 
                        controllerAtual = controller;
                    controllerCardServicesCashFlowRelatorios = controller;
                    return $scope.goCardServicesCashFlowRelatorios; 
                }
                if($location.path() === $state.get('card-services-consolidacao-relatorios').url) 
                    controllerAtual = controller;
                controllerCardServicesConsolidacaoRelatorios = controller;
                return $scope.goCardServicesConsolidacaoRelatorios; 
            // ...
            default : return null;        
        }
    };
    
    // PERMISSÕES
    /**
      * Atribui a permissão para o respectivo controller 
      * OBS: título não é uma boa referência. O ideal seria identificadores, 
      * visto que podem existir títulos idênticos em Serviços distintos
      */                         
    var atribuiPermissao = function(controller, controllerpai){
        switch(controller.ds_controller.toUpperCase()){
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
            case 'AÇÕES DE USUÁRIOS': $scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACOES_USUARIOS = true; break;
            // Card Services
            case 'CARD SERVICES': $scope.PERMISSAO_CARD_SERVICES = true; break;
            case 'CASH FLOW' : $scope.PERMISSAO_CARD_SERVICES_CASH_FLOW = true; break;
            case 'CONCILIAÇÃO': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO = true; break;
            case 'CONCILIAÇÃO DE VENDAS': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_VENDAS = true; break;
            case 'CONSOLIDAÇÃO': $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO = true; break;   
            case 'DADOS DE ACESSO': $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_DADOS_ACESSO = true; break; 
            case 'SENHAS INVÁLIDAS': $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_SENHAS_INVALIDAS = true; break;    
            // Dashboard
            case 'DASHBOARD ATOS': $scope.PERMISSAO_DASHBOARD = true; break;
                
            // AMBÍGUOS    
            case 'RELATÓRIOS': controllerpai.ds_controller.toUpperCase() === 'CASH FLOW' ? 
                                $scope.PERMISSAO_CARD_SERVICES_CASH_FLOW_RELATORIOS = true  :
                                $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_RELATORIOS = true; 
                               break;
            
            // ...
            default : return ;        
        }
    };
             
                            
                            
    // MENU
    var itemExpand = 0;                        
    $scope.itemExpandIs = function(id){
        return itemExpand === id; 
    };
    $scope.expandItem = function(item){
        if(item){
            itemExpand = item.id_controller;
            item.expand = true;
        }else itemExpand = 0;
    };
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
    $scope.moduloAtivo = function(titulo, titulopai){//id_controller){
        var state = $state.current.url.split('/')[2]; // nome da pasta inicial da url do estado atual
        switch(titulo.toUpperCase()){//id_controller){
            // Administrativo
            case 'USUÁRIOS' : return state == 'usuarios' || state == 'cadastro-usuarios';
            case 'PRIVILÉGIOS' : return state == 'privilegios';
            case 'MÓDULOS E FUNCIONALIDADES' : return state == 'modulos-funcionalidades';
            case 'EMPRESAS' : return state == 'empresas';
            case 'FILIAIS' :  return state == 'filiais' || state == 'cadastro-filiais';  
            case 'ACESSO DE USUÁRIOS' : return state == 'acesso-usuarios';  
            case 'AÇÕES DE USUÁRIOS': return state == 'acoes-usuarios';
            // Card Services
            case 'CONCILIAÇÃO DE VENDAS': return state == 'conciliacao-vendas';
            case 'DADOS DE ACESSO': return state == 'dados-acesso';
            case 'SENHAS INVÁLIDAS': return state == 'senhas-invalidas';    
                
            // AMBÍGUOS    
            case 'RELATÓRIOS': return titulopai.toUpperCase() === 'CASH FLOW' ? 
                                state == 'cash-flow-relatorios' :
                                state == 'consolidacao-relatorios';
                
            default : return false;        
        }        
    };
    /**
      * Selecionou um item na busca de menus
      */                        
    $scope.selecionaItemMenuLink = function(item){
        if(item){
            $scope.goLinkController(item.controller);
            $scope.buscaItemLink = undefined;
        }
    };
    /**
      * A partir do JSON recebido, obtem o JSON menu e as permissões do usuário
      */                        
    var constroiMenu = function(data){        
        // Constrói o menu
        $scope.menu = [];
        $scope.itensMenuLink = [];
        var temLink = false;
        var setouPaginaInicial = false;
        for(var k = 0; k < data.controllers.length; k++){
            var controller = data.controllers[k];
            
            if(controller.ds_controller.trim().toUpperCase().indexOf('[MOBILE]') == 0){
                // Controller de mobile
                continue;
            }
                
            var menu = {};
            menu.ds_controller = controller.ds_controller;
            menu.id_controller = controller.id_controller;
            // Métodos
            //menu.methods = controller.methods;
            menu.methods = {};
            for(var m = 0; m < controller.methods.length; m++)
                menu.methods[controller.methods[m].ds_method.toLowerCase()] = true;
            //console.log("METHODS OF " + menu.ds_controller);console.log(menu.methods);
            // Atribui permissão
            atribuiPermissao(menu);
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
                    // Métodos
                    //subMenu.methods = subController1.methods;
                    subMenu.methods = {};
                    for(var m = 0; m < subController1.methods.length; m++)
                        subMenu.methods[subController1.methods[m].ds_method.toLowerCase()] = true;
                    //console.log("METHODS OF " + subMenu.ds_controller);console.log(subMenu.methods);
                    // Atribui permissão
                    atribuiPermissao(subMenu, menu);
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
                            // Métodos
                            //itemMenu.methods = subController2.methods;
                            itemMenu.methods = {};
                            for(var m = 0; m < subController2.methods.length; m++)
                                itemMenu.methods[subController2.methods[m].ds_method.toLowerCase()] = true;
                            //console.log("METHODS OF " + itemMenu.ds_controller);console.log(itemMenu.methods);
                            // Atribui permissão
                            atribuiPermissao(itemMenu, subMenu);
                            // A priori não tem premissão
                            itemMenu.temLink = false;
                            
                            itemMenu.link = getLink(itemMenu, subMenu);
                            if(itemMenu.link === null) itemMenu.link = function(){};
                            else{ 
                                itemMenu.temLink = subMenu.temLink = menu.temLink = temLink = true;
                                // Item de menu com link
                                $scope.itensMenuLink.push({ path : menu.ds_controller + ' > ' + 
                                                                   subMenu.ds_controller + ' > ' + 
                                                                   itemMenu.ds_controller,
                                                            controller : itemMenu
                                                            //link : itemMenu.link
                                                          });
                                // Página principal?
                                if(subController2.home){ 
                                    if(!setouPaginaInicial){
                                        controllerHome = itemMenu;
                                        setouPaginaInicial = true;
                                    }
                                }else if(!controllerHome) controllerHome = itemMenu;
                            }
                            // Adiciona o módulo
                            subMenu.subControllers.push(itemMenu);
                        }
                    }else{
                        // Se não tem módulos, então deve ter um link
                        subMenu.link = getLink(subMenu, menu); 
                        if(subMenu.link === null) subMenu.link = function(){};
                        else{ 
                            subMenu.temLink = menu.temLink = temLink = true;
                            // Item de menu com link
                            $scope.itensMenuLink.push({ path : menu.ds_controller + ' > ' + 
                                                               subMenu.ds_controller,
                                                        controller : subMenu
                                                        //link : subMenu.link
                                                      });
                            // Página principal?       
                            if(subController1.home){ 
                                if(!setouPaginaInicial){
                                    controllerHome = subMenu;
                                    setouPaginaInicial = true;
                                }
                            }else if(!controllerHome) controllerHome = subMenu;
                        }
                    }
                    
                    // Adiciona o subserviço
                    menu.subControllers.push(subMenu);
                }
            }else{
                // Se não tem subserviços, então deve ter um link
                menu.link = getLink(menu); 
                if(menu.link === null) menu.link = function(){};
                else{ 
                    menu.temLink = temLink = true;
                    // Item de menu com link
                    $scope.itensMenuLink.push({ path : menu.ds_controller,
                                                controller : menu
                                                //link : menu.link
                                              });
                    // Página principal?       
                    if(controller.home){ 
                        if(!setouPaginaInicial){
                            controllerHome = menu;
                            setouPaginaInicial = true;
                        }
                    }else if(!controllerHome) controllerHome = subMenu;
                }
            }
            
            // Adiciona o menu
            $scope.menu.push(menu);
        }
        
        if(data.filtro_empresa) $scope.PERMISSAO_FILTRO_EMPRESA = true;
        
        //data.id_grupo = 12; // TEMP
        
        // Verifica se estava administrando algum grupo empresa
        if(data.id_grupo && data.id_grupo !== -1) obtemGrupoEmpresa(data.id_grupo, data.nu_cnpj);
        
        // Seta o flag para true
        $scope.menuConstruido = true;
        
        // Retorna se tem link para acessar
        return temLink;
    };
                            
                            
    // LAYOUT  
    $scope.status = { isopen: false };
    /**
      * Exibe o layout e inicializa seus handlers
      */
    var exibeLayout = function(){
        // Inicializa todos os handlers de layout 
        angular.element(document).ready(function(){ 
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
        if(controllerAtual){
            $scope.goLinkController(controllerAtual);
            return;
        }
        switch($location.path()){
            case $state.get('minha-conta').url :
                $scope.goMinhaConta(); break;
            case $state.get('minha-conta-alterar-senha').url :
                $scope.goMinhaContaAlterarSenha(); break;
            default : $scope.goHome(); // Exibe tela inicial
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
        //console.log($scope.token);
        
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
                if(constroiMenu(dados)){ 
                    //$scope.usuarioTemAcesso = true;
                    exibePaginaAtual(); // Exibe a página atual
                }else $scope.goUsuarioSemLinks(); // exibe que o usuário não tem link
                // Atualiza último datetime de autenticação
                $autenticacao.atualizaDateTimeDeAutenticacao(new Date());
                // Remove o loading da página
                $scope.hideProgress();
            },
            function(failData){
              // Avaliar código de erro
              if(failData.status === 500 || // Código 500 => Token já não é mais válido
                 failData.status === 401 || // Não autorizado
                 failData.status === 0 || // time out 
                 failData.status === 503 || failData.status === 404) // serviço indisponível
                  $scope.voltarTelaLogin(); // Volta para a tela de login
              else console.log("FALHA AO VALIDAR TOKEN: " + failData.status);
                  // o que fazer? exibir uma tela indicando falha de comunicação?
                  // Status 0: sem resposta
              // Remove o loading da página
              $scope.hideProgress();
            });
    };
                            
                            
                            
    // GRUPO EMPRESA
    /**
      * Altera a visibilidade
      */
    $scope.setVisibilidadeBoxGrupoEmpresa = function(visivel){
        if($scope.PERMISSAO_FILTRO_EMPRESA && $scope.PERMISSAO_ADMINISTRATIVO){
            if(visivel){ 
                $('#admBuscaGrupoEmpresa').parent().addClass('open'); 
                $window.scrollTo(0, 0); // scroll to top
            }else $('#admBuscaGrupoEmpresa').parent().removeClass('open');
        }
    };
                            
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
    var obtemGrupoEmpresa = function(empresaId, nu_cnpj){
         // Obtém os dados da empresa
         progressoGrupoEmpresas(true);
         // Obtém a URL                                                      
         $webapi.get($apis.getUrl($apis.cliente.grupoempresa, [$scope.token, 0], 
                                  {id:$campos.cliente.grupoempresa.id_grupo, valor: empresaId}))
            .then(function(dados){  
                $scope.usuariologado.grupoempresa = dados.Registros[0];
                $scope.$broadcast("alterouGrupoEmpresa");
                progressoGrupoEmpresas(false);
                if(nu_cnpj) obtemEmpresa(nu_cnpj);
             },
             function(failData){
                if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                else $scope.showAlert('Houve uma falha ao se associar a empresa (' + failData.status + ')', true, 'danger', true);
                progressoGrupoEmpresas(false);
             });    
    };
    /**
      * Obtém uma única empresa, a partir do nu_cnpj
      */
    var obtemEmpresa = function(nu_cnpj){
         // Obtém os dados da empresa
         progressoGrupoEmpresas(true);
         // Obtém a URL                                                      
         $webapi.get($apis.getUrl($apis.cliente.empresa, [$scope.token, 0], 
                                  {id:$campos.cliente.empresa.nu_cnpj, valor: nu_cnpj}))
            .then(function(dados){  
                $scope.usuariologado.empresa = dados.Registros[0];
                $scope.$broadcast("alterouGrupoEmpresa");
                progressoGrupoEmpresas(false);
             },
             function(failData){
                if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                else $scope.showAlert('Houve uma falha ao se associar a filial (' + failData.status + ')', true, 'danger', true);
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
             //console.log("FALHA AO OBTER GRUPOS EMPRESA FILTRADOS: " + failData.status);
             progressoGrupoEmpresas(false);
             return [];
          });
    };                   
    /** 
      * Seleciona Grupo Empresa
      */
    $scope.selecionaGrupoEmpresa = function(grupoempresa, funcaoSucesso){
        associaUsuarioAGrupoEmpresa(grupoempresa.id_grupo, 
                                    function(dados){ 
                                        $scope.usuariologado.grupoempresa = grupoempresa;
                                        $scope.usuariologado.empresa = undefined;
                                        if(typeof funcaoSucesso === 'function') funcaoSucesso();
                                     }
                                   );
    };
    /** 
      * Limpar Grupo Empresa
      */
    $scope.limpaGrupoEmpresa = function(funcaoSucesso){
        associaUsuarioAGrupoEmpresa(-1, function(dados){ 
                                            $scope.usuariologado.grupoempresa = undefined;
                                            $scope.usuariologado.empresa = undefined;
                                            if(typeof funcaoSucesso === 'function') funcaoSucesso();
                                         }
                                   );
    };
    var associaUsuarioAGrupoEmpresa = function(id_grupo, funcaoSucesso){
        //console.log(id_grupo);
        // Envia 
        $scope.showProgress();
        $webapi.update($apis.getUrl($apis.administracao.webpagesusers, undefined, 
                                    {id:'token', valor: $scope.token}), {id_grupo: id_grupo})
            .then(function(dados){  
                // Executa a função
                if(typeof funcaoSucesso === 'function') funcaoSucesso(dados);
                // Reinicia o valor do model
                $scope.gempresa = null; 
                // Remove da visão a tela de busca do grupo empresa
                $scope.setVisibilidadeBoxGrupoEmpresa(false);
                // Notifica
                $scope.$broadcast("alterouGrupoEmpresa");
                // Remove o progress
                $scope.hideProgress();
             },
             function(failData){
                if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
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
        $scope.alerta.funcaoOk = typeof funcaoOk === 'function' ? 
                                    function(){funcaoOk(); fechaModalAlerta()}  : 
                                    function(){fechaModalAlerta()};
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
   $scope.showProgress = function(divPortletBodyPos, zIndex){
        var el = getElementProgress(divPortletBodyPos);
        Metronic.blockUI({
            target: el,
            animate: true,
            overlayColor: '#000',//'none'
            zIndex : zIndex
        }); 
   };
   /**
     * Remove da visão o loading progress no portlet-body
     */                         
   $scope.hideProgress = function(divPortletBodyPos){
        var el = getElementProgress(divPortletBodyPos);
        Metronic.unblockUI(el);
   };     
                            
                            
                            
   // FUNÇÕES EXTRAS
   /**
     * Retorna true se os dois arrays são iguais (contém mesmas keys com mesmos correspondentes valores)
     */
   $scope.arraysAreEqual = function(ary1, ary2){
      return (ary1.join('') == ary2.join(''));
   };
   /**
     * Retorna a data do tipo Date yyyy-MM-dd em string dd/MM/yyyy
     */
   $scope.getDataString = function(data){
        if(typeof data !== 'undefined' && data !== null) 
            return data.substr(8, 2) + '/' + data.substr(5, 2) + '/' + data.substr(0, 4);
        return '';
   };
   $scope.getDataTimeString = function(data){
        // 2015-07-21T10:51:15.917  
        if(typeof data !== 'undefined' && data !== null) 
            return data.substr(8, 2) + '/' + data.substr(5, 2) + '/' + data.substr(0, 4) + 
                   ' ' + data.substr(11,5);
        return '';
   };
   /**
      * Retorna a string aceita para filtro de data
      */
   $scope.getFiltroData = function(data){
        var ano = data.getFullYear(); 
        var mes = (data.getMonth() + 1); 
        var dia = data.getDate(); 
        
        if(ano >= 1000) ano = '' + ano; 
        else if(ano >= 100) ano = '0' + ano;
        else if(ano >= 10) ano = '00' + ano;
        else ano = '000' + ano;
        
        if(mes >= 10) mes = '' + mes;
        else mes = '0' + mes;
        
        if(dia >= 10) dia = '' + dia;
        else dia = '0' + dia;
        
        return ano + mes + dia;
    };                       
                            
}])



// Init global settings and run the app
.run(['$rootScope', '$location', function($rootScope, $location) {
    // Título da página
    $rootScope.$on('$stateChangeSuccess', function (event, current, previous) {
        if(current.data) $rootScope.titulo = current.data.titulo;
    });
}]);