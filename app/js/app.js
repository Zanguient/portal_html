/*
 *  Atos Capital - www.atoscapital.com.br
 *
 *  suporte@atoscapital.com.br
 *
 *
 *
 *  Versão 1.0.6 - 22/10/2015
 *  - Tela Movimento TEF
 *
 *  Versão 1.0.5 - 19/10/2015
 *  - Nova Coluna em CardServices : TEF, e novas telas; CardServices > TEF > Movimento e CardServices > TEF >Resumo de Movimento 
 *
 *  Versão 1.0.4 - 29/09/2015
 *  - Administrativo > Gestão de Acessos  > Parâmetros de Notícias
 *
 *  Versão 1.0.3 - 25/09/2015
 *  - Tax Services > Nota Fiscal Eletrônica > Recebimento NFE
 *
 *  Versão 1.0.2 - 22/09/2015
 *  - Função download
 *
 *  Versão 1.0.1 - 08/09/2015
 *  - getNomeLoginOperadoraAmigavel também considerando o grupo empresa
 *
 *  Versão 1.0 - 03/09/2015
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
                               //'administrativo-parametros-noticias',
                               'administrativo-privilegios',
                               'administrativo-modulos-funcionalidades',
                               'administrativo-empresas',
                               'administrativo-filiais',
                               'administrativo-filiais-cadastro',
                               'administrativo-dados-acesso',
                               'administrativo-senhas-invalidas',
                               'administrativo-contas-correntes',
                               'administrativo-contas-correntes-vigencias',
                               'administrativo-extratos-bancarios',
                               'administrativo-parametros-bancarios',
                               'administrativo-acesso-usuarios',
                               'administrativo-acoes-usuarios',
                               'administrativo-monitor-cargas',
                               'administrativo-monitor-cargas-boot',
                               'administrativo-consulta-pos-terminal',
                               'dashboard',
                               'card-services-cash-flow-relatorios',
                               'card-services-conciliacao-bancaria',
                               'card-services-conciliacao-vendas',
                               'card-services-conciliacao-terminal-logico',
                               'card-services-conciliacao-vendas-dia',
                               'card-services-conciliacao-relatorios',
                               'card-services-consolidacao-relatorios',
                               'card-services-consolidacao-movimento-tef',
                               'card-services-cadastro-codigo-autorizacao',
                               'card-services-lancamento-vendas',
                               'card-services-movimento',
                               'card-services-resumo-de-movimento',
                               'tax-services-importacao-xml',
                               'tax-services-cadastro-certificado-digital',
                               'tax-services-recebimento-nfe',
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

    // HTML5
    if(window.history && window.history.pushState){
        $locationProvider.html5Mode({enable: true, requireBase: false}).hashPrefix('!');
        //prefixo = '!/';
    }

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

      .state('administrativo-gestao-acessos-parametros-noticias', {
        url: prefixo + 'administrativo/parametros-noticias',
        templateUrl: 'componentes/administrativo/gestao-acessos/parametros-noticias/index.html',
        controller: "administrativo-parametros-noticiasCtrl",
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

      .state('administrativo-gestao-empresas-dados-acesso', {
        url: prefixo + 'administrativo/dados-acesso',
        templateUrl: 'componentes/administrativo/gestao-empresas/dados-acesso/index.html',
        controller: "administrativo-dados-acessoCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })

      .state('administrativo-gestao-empresas-senhas-invalidas', {
        url: prefixo + 'administrativo/senhas-invalidas',
        templateUrl: 'componentes/administrativo/gestao-empresas/senhas-invalidas/index.html',
        controller: "administrativo-senhas-invalidasCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })

      .state('administrativo-gestao-empresas-consulta-pos-terminal', {
        url: prefixo + 'administrativo/consulta-pos-terminal',
        templateUrl: 'componentes/administrativo/gestao-empresas/consulta-pos-terminal/index.html',
        controller: "administrativo-consulta-pos-terminalCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })

      .state('administrativo-dados-bancarios-contas-correntes', {
        url: prefixo + 'administrativo/contas-correntes',
        templateUrl: 'componentes/administrativo/dados-bancarios/contas-correntes/index.html',
        controller: "administrativo-contas-correntesCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })

      .state('administrativo-dados-bancarios-contas-correntes-vigencias', {
        url: prefixo + 'administrativo/conta-corrente-vigencias',
        params: {conta: null, adquirentesempresas: null},
        templateUrl: 'componentes/administrativo/dados-bancarios/contas-correntes/views/vigencias/index.html',
        controller: "administrativo-contas-correntes-vigenciasCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })

      .state('administrativo-dados-bancarios-extratos-bancarios', {
        url: prefixo + 'administrativo/extratos-bancarios',
        params: {conta: null},
        templateUrl: 'componentes/administrativo/dados-bancarios/extratos-bancarios/index.html',
        controller: "administrativo-extratos-bancariosCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })

      .state('administrativo-dados-bancarios-parametros-bancarios', {
        url: prefixo + 'administrativo/parametros-bancarios',
        templateUrl: 'componentes/administrativo/dados-bancarios/parametros-bancarios/index.html',
        controller: "administrativo-parametros-bancariosCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })

      .state('administrativo-monitor-monitor-cargas', {
        url: prefixo + 'administrativo/monitor-cargas',
        templateUrl: 'componentes/administrativo/monitor/monitor-cargas/index.html',
        controller: "administrativo-monitor-cargasCtrl",
        data: {
            titulo: 'Administrativo'
        }
      })
    
      .state('administrativo-monitor-monitor-cargas-boot', {
        url: prefixo + 'administrativo/monitor-cargas-boot',
        templateUrl: 'componentes/administrativo/monitor/monitor-cargas-boot/index.html',
        controller: "administrativo-monitor-cargas-bootCtrl",
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
      .state('card-services-cash-flow-relatorios', {
        url: prefixo + 'card-services/cash-flow-relatorios',
        templateUrl: 'componentes/card-services/cash-flow/relatorios/index.html',
        controller: "card-services-cash-flow-relatoriosCtrl",
        data: {
            titulo: 'Card Services'
        }
      })

      .state('card-services-conciliacao-conciliacao-bancaria', {
        url: prefixo + 'card-services/conciliacao-bancaria',
        templateUrl: 'componentes/card-services/conciliacao/conciliacao-bancaria/index.html',
        controller: "card-services-conciliacao-bancariaCtrl",
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

      .state('card-services-conciliacao-conciliacao-terminal-logico', {
        url: prefixo + 'card-services/conciliacao-terminal-logico',
        templateUrl: 'componentes/card-services/conciliacao/conciliacao-terminal-logico/index.html',
        controller: "card-services-conciliacao-terminal-logicoCtrl",
        data: {
            titulo: 'Card Services'
        }
      })

      .state('card-services-conciliacao-conciliacao-vendas-dia', {
        url: prefixo + 'card-services/conciliacao-vendas-dia',
        templateUrl: 'componentes/card-services/conciliacao/conciliacao-vendas-dia/index.html',
        controller: "card-services-conciliacao-vendas-diaCtrl",
        data: {
            titulo: 'Card Services'
        }
      })
    
       .state('card-services-conciliacao-relatorios', {
        url: prefixo + 'card-services/conciliacao-relatorios',
        templateUrl: 'componentes/card-services/conciliacao/relatorios/index.html',
        controller: "card-services-conciliacao-relatoriosCtrl",
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

      .state('card-services-consolidacao-cadastro-codigo-autorizacao', {
        url: prefixo + 'card-services/cadastro-codigo-autorizacao',
        templateUrl: 'componentes/card-services/consolidacao/cadastro-codigo-autorizacao/index.html',
        controller: "card-services-cadastro-codigo-autorizacaoCtrl",
        data: {
            titulo: 'Card Services'
        }
      })

      .state('card-services-consolidacao-lancamento-vendas', {
        url: prefixo + 'card-services/lancamento-vendas',
        templateUrl: 'componentes/card-services/consolidacao/lancamento-vendas/index.html',
        controller: "card-services-lancamento-vendasCtrl",
        data: {
            titulo: 'Card Services'
        }
      })
    
    .state('card-services-consolidacao-movimento-tef', {
        url: prefixo + 'card-services/movimento-tef',
        templateUrl: 'componentes/card-services/consolidacao/movimento-tef/index.html',
        controller: "card-services-consolidacao-movimento-tefCtrl",
        data: {
            titulo: 'Card Services'
        }
      })
    
      .state('card-services-tef-movimento', {
        url: prefixo + 'card-services/movimento',
        templateUrl: 'componentes/card-services/tef/movimento/index.html',
        controller: "card-services-movimentoCtrl",
        data: {
            titulo: 'Card Services'
        }
      })
    
      .state('card-services-tef-resumo-de-movimento', {
        url: prefixo + 'card-services/resumo-de-movimento',
        templateUrl: 'componentes/card-services/tef/resumo-de-movimento/index.html',
        controller: "card-services-resumo-de-movimentoCtrl",
        data: {
            titulo: 'Card Services'
        }
      })



      // TAX SERVICES
      .state('tax-services-nota-fiscal-eletronica-importacao-xml', {
        url: prefixo + 'tax-services/importacao-xml',
        templateUrl: 'componentes/tax-services/nota-fiscal-eletronica/importacao-xml/index.html',
        controller: "tax-services-importacao-xmlCtrl",
        data: {
            titulo: 'Tax Services'
        }
      })

      .state('tax-services-nota-fiscal-eletronica-cadastro-certificado-digital', {
        url: prefixo + 'tax-services/cadastro-certificado-digital',
        templateUrl: 'componentes/tax-services/nota-fiscal-eletronica/cadastro-certificado-digital/index.html',
        controller: "tax-services-cadastro-certificado-digitalCtrl",
        data: {
            titulo: 'Tax Services'
        }
      })

      .state('tax-services-nota-fiscal-eletronica-recebimento-nfe', {
        url: prefixo + 'tax-services/recebimento-nfe',
        templateUrl: 'componentes/tax-services/nota-fiscal-eletronica/recebimento-nfe/index.html',
        controller: "tax-services-recebimento-nfeCtrl",
        data: {
            titulo: 'Tax Services'
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
                        '$filter',
                        '$autenticacao',
                        '$apis',
                        '$webapi',
                        '$sce',
                        '$empresa',
                        /*'$campos',*/
                        function($scope,$rootScope,$window,$location,$state,$stateParams,$http,$timeout,$filter,
                                 $autenticacao,$apis,$webapi,$sce,$empresa/*,$campos*/){
    // Título da página
    $scope.pagina = {'titulo': 'Home', 'subtitulo': ''};
    // Usuário
    $rootScope.token = $scope.token = '';
    $scope.nome_usuario = 'Usuário';
    // Dados da empresa
    $scope.empresa = $empresa;
    $rootScope.signalRRootPath = $scope.signalRRootPath = $autenticacao.getUrlBaseIMessage() + "/signalr";
    $scope.signalRHubsPath = $sce.trustAsResourceUrl($scope.signalRRootPath + "/hubs");
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
    var controllerAdministrativoParametrosNoticias = undefined;
    var controllerAdministrativoPrivilegios = undefined;
    var controllerAdministrativoModulosFuncionalidades = undefined;
    var controllerAdministrativoEmpresas = undefined;
    var controllerAdministrativoFiliais = undefined;
    //var controllerAdministrativoFiliaisCadastro = undefined;
    var controllerAdministrativoDadosAcesso = undefined;
    var controllerAdministrativoSenhasInvalidas = undefined;
    var controllerAdministrativoContasCorrentes = undefined;
    var controllerAdministrativoExtratosBancarios = undefined;
    var controllerAdministrativoParametrosBancarios = undefined;
    var controllerAdministrativoAcessoUsuarios = undefined;
    var controllerAdministrativoAcoesUsuarios = undefined;
    var controllerAdministrativoMonitorCargas = undefined;
    var controllerAdministrativoMonitorCargasBoot = undefined; 
    var controllerAdministrativoConsultaPOSTerminal = undefined;
    var controllerDashboard = undefined;
    var controllerCardServicesCashFlowRelatorios = undefined;
    var controllerCardServicesConciliacaoBancaria = undefined;
    var controllerCardServicesConciliacaoVendas = undefined;
    var controllerCardServicesConciliacaoTerminalLogico = undefined;
    var controllerCardServicesConciliacaoVendasDia = undefined;
    var controllerCardServicesConciliacaoRelatorios = undefined;                        
    var controllerCardServicesConsolidacaoRelatorios = undefined;
    var controllerCardServicesConsolidacaoMovimentoTef = undefined;
    var controllerCardServicesCadastroCodigoAutorizacao = undefined;
    var controllerCardServicesLancamentoVendas = undefined;
    var controllerCardServicesMovimento = undefined; 
    var controllerCardServicesResumoDeMovimento = undefined;                         
    var controllerTaxServicesImportacaoXML = undefined;
    var controllerTaxServicesCadastroCertificadoDigital = undefined;
    var controllerTaxServicesRecebimentoNfe = undefined;
    var controllerMinhaConta = {id_controller : 91, ds_controller : 'Minha Conta', methods : []};
    // Permissões
    //$scope.usuarioTemAcesso = false;
    $scope.PERMISSAO_FILTRO_EMPRESA = false;
    $scope.PERMISSAO_ADMINISTRATIVO = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PARAMETROS_NOTICIAS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_USUARIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PRIVILEGIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_MODULOS_FUNCIONALIDADES = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_EMPRESAS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_FILIAIS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_DADOS_ACESSO = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_SENHAS_INVALIDAS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_CONSULTA_POS_TERMINAL = false;
    $scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS_CONTAS_CORRENTES = false;
    $scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS_EXTRATOS_BANCARIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS_PARAMETROS_BANCARIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_LOGS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACESSO_USUARIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACOES_USUARIOS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_MONITOR = false;
    $scope.PERMISSAO_ADMINISTRATIVO_MONITOR_MONITOR_CARGAS = false;
    $scope.PERMISSAO_ADMINISTRATIVO_MONITOR_MONITOR_CARGAS_BOOT = false; 
    $scope.PERMISSAO_DASHBOARD = false;
    $scope.PERMISSAO_CARD_SERVICES = false;
    $scope.PERMISSAO_CARD_SERVICES_CASH_FLOW = false;
    $scope.PERMISSAO_CARD_SERVICES_CASH_FLOW_RELATORIOS = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_BANCARIA = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_VENDAS = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_TERMINAL_LOGICO = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_VENDAS_DIA = false;
    $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_RELATORIOS = false;                        
    $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO = false;
    $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_RELATORIOS = false;
    $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_CADASTRO_CODIGO_AUTORIZACAO = false;
    $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_LANCAMENTO_VENDAS = false;
    $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_MOVIMENTO_TEF = false;
    $scope.PERMISSAO_CARD_SERVICES_TEF_MOVIMENTO = false;  
    $scope.PERMISSAO_CARD_SERVICES_TEF_RESUMO_DE_MOVIMENTO = false;                         
    $scope.PERMISSAO_TAX_SERVICES = false;
    $scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA = false;
    $scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA_IMPORTACAO_XML = false;
    $scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA_CADASTRO_CERTIFICADO_DIGITAL = false;
    $scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA_RECEBIMENTO_NFE = false;


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
    var ultimoController = 0;
    // Indica que uma tela foi acessada => envia para a API
    $scope.$on("acessouTela", function(event){
        if(controllerAtual && typeof controllerAtual.id_controller === 'number'){
            if(controllerAtual.id_controller === ultimoController){
                $scope.$broadcast('acessoDeTelaNotificado');
                return;
            }
            //ultimoController = controllerAtual.id_controller;
            //$scope.$broadcast('acessoDeTelaNotificado');

            $scope.showProgress();
            $webapi.post($apis.getUrl($apis.administracao.logacesso, undefined,
                                  {id: 'token', valor: $scope.token}), {idController : controllerAtual.id_controller})
                .then(function(dados){
                     ultimoController = controllerAtual.id_controller;
                     $scope.hideProgress();
                     $scope.$broadcast('acessoDeTelaNotificado');
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao se comunicar com o servidor (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress();
                     //console.log('Houve uma falha ao notificar o acesso da tela (' + failData.status + ')');
                  });
        }
    });
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
      * Exibe como conteúdo a Gestão de Acessos Parâmetros Notícias, de Administrativo
      */
    $scope.goAdministrativoParametrosNoticias = function(params){
        controllerAtual = controllerAdministrativoParametrosNoticias;
        go('administrativo-gestao-acessos-parametros-noticias', params);
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
      * Exibe como conteúdo a Dados Acesso Gestão de Empresas, de Administrativo
      */
    $scope.goAdministrativoDadosAcesso = function(params){
        controllerAtual = controllerAdministrativoDadosAcesso;
        go('administrativo-gestao-empresas-dados-acesso', params);
    };
    /**
      * Exibe como conteúdo a Senhas Inválidas Gestão de Empresas, de Administrativo
      */
    $scope.goAdministrativoSenhasInvalidas = function(params){
        controllerAtual = controllerAdministrativoSenhasInvalidas;
        go('administrativo-gestao-empresas-senhas-invalidas', params);
    };
    /**
      * Exibe como conteúdo a Consulta POS/Terminal Gestão de Empresas, de Administrativo
      */
    $scope.goAdministrativoConsultaPOSTerminal = function(params){
        controllerAtual = controllerAdministrativoConsultaPOSTerminal;
        go('administrativo-gestao-empresas-consulta-pos-terminal', params);
    };
    /**
      * Exibe como conteúdo a Contas Correntes Dados Bancários, de Administrativo
      */
    $scope.goAdministrativoContasCorrentes = function(params){
        controllerAtual = controllerAdministrativoContasCorrentes;
        go('administrativo-dados-bancarios-contas-correntes', params);
    };
    /**
      * Exibe como conteúdo as Vigências de Contas Correntes Dados Bancários, de Administrativo
      */
    $scope.goAdministrativoContasCorrentesVigencias = function(params){
        controllerAtual = controllerAdministrativoContasCorrentes;//Vigencias;
        go('administrativo-dados-bancarios-contas-correntes-vigencias', params);
    };
    /**
      * Exibe como conteúdo Extratos Bancários Dados Bancários, de Administrativo
      */
    $scope.goAdministrativoExtratosBancarios = function(params){
        controllerAtual = controllerAdministrativoExtratosBancarios;
        go('administrativo-dados-bancarios-extratos-bancarios', params);
    };
    /**
      * Exibe como conteúdo Parâmetros Bancários Dados Bancários, de Administrativo
      */
    $scope.goAdministrativoParametrosBancarios = function(params){
        controllerAtual = controllerAdministrativoParametrosBancarios;
        go('administrativo-dados-bancarios-parametros-bancarios', params);
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
      * Exibe como conteúdo a Monitor Monitor de Cargas, de Administrativo
      */
    $scope.goAdministrativoMonitorCargas = function(params){
        controllerAtual = controllerAdministrativoMonitorCargas;
        go('administrativo-monitor-monitor-cargas', params);
    };
    /**
      * Exibe como conteúdo a Monitor Monitor de Cargas do Boot, de Administrativo
      */                        
    $scope.goAdministrativoMonitorCargasBoot = function(params){
        controllerAtual = controllerAdministrativoMonitorCargasBoot;
        go('administrativo-monitor-monitor-cargas-boot', params);
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
      * Exibe como conteúdo a Conciliação Conciliação Bancária, de Card Services
      */
    $scope.goCardServicesConciliacaoBancaria = function(params){
        controllerAtual = controllerCardServicesConciliacaoBancaria;
        go('card-services-conciliacao-conciliacao-bancaria', params);
    };
    /**
      * Exibe como conteúdo a Conciliação Conciliação de Vendas, de Card Services
      */
    $scope.goCardServicesConciliacaoVendas = function(params){
        controllerAtual = controllerCardServicesConciliacaoVendas;
        go('card-services-conciliacao-conciliacao-vendas', params);
    };
    /**
      * Exibe como conteúdo a Conciliação Conciliação Terminal Lógico, de Card Services
      */
    $scope.goCardServicesConciliacaoTerminalLogico = function(params){
        controllerAtual = controllerCardServicesConciliacaoTerminalLogico;
        go('card-services-conciliacao-conciliacao-terminal-logico', params);
    };
    /**
      * Exibe como conteúdo a Conciliação Conciliação de Vendas Dia, de Card Services
      */
    $scope.goCardServicesConciliacaoVendasDia = function(params){
        controllerAtual = controllerCardServicesConciliacaoVendasDia;
        go('card-services-conciliacao-conciliacao-vendas-dia', params);
    };
    /**
      * Exibe como conteúdo a Conciliação Relatótios, de Card Services
      */
    $scope.goCardServicesConciliacaoRelatorios = function(params){
        controllerAtual = controllerCardServicesConciliacaoRelatorios;
        go('card-services-conciliacao-relatorios', params);
    };                        
    /**
      * Exibe como conteúdo a Consolidação Relatórios, de Card Services
      */
    $scope.goCardServicesConsolidacaoRelatorios = function(params){
        controllerAtual = controllerCardServicesConsolidacaoRelatorios;
        go('card-services-consolidacao-relatorios', params);
    };
    /**
      * Exibe como conteúdo a Consolidação Cadastro de Código de Autorização, de Card Services
      */
    $scope.goCardServicesCadastroCodigoAutorizacao = function(params){
        controllerAtual = controllerCardServicesCadastroCodigoAutorizacao;
        go('card-services-consolidacao-cadastro-codigo-autorizacao', params);
    };
    /**
      * Exibe como conteúdo a Consolidação Lançamento de Vendas, de Card Services
      */
    $scope.goCardServicesLancamentoVendas = function(params){
        controllerAtual = controllerCardServicesLancamentoVendas;
        go('card-services-consolidacao-lancamento-vendas', params);
    };
    /**
      * Exibe como conteúdo a Consolidação Movimento TEF, de Card Services
      */
    $scope.goCardServicesMovimentoTef = function(params){
        controllerAtual = controllerCardServicesMovimentoTef;
        go('card-services-consolidacao-movimento-tef', params);
    };                        
    /**
      * Exibe como conteúdo a Movimento, de TEF
      */
    $scope.goCardServicesMovimento = function(params){
        controllerAtual = controllerCardServicesMovimento;
        go('card-services-tef-movimento', params);
    }; 
    /**
      * Exibe como conteúdo a Resumo de Movimento, de TEF
      */
    $scope.goCardServicesResumoDeMovimento = function(params){
        controllerAtual = controllerCardServicesResumoDeMovimento;
        go('card-services-tef-resumo-de-movimento', params);
    };                         
    /**
      * Exibe como conteúdo a Nota Fiscal Eletrônica Importação XML, de Tax Services
      */
    $scope.goTaxServicesImportacaoXML = function(params){
        controllerAtual = controllerTaxServicesImportacaoXML;
        go('tax-services-nota-fiscal-eletronica-importacao-xml', params);
    };
    /**
      * Exibe como conteúdo a Nota Fiscal Eletrônica Cadastro Certificado Digital, de Tax Services
      */
    $scope.goTaxServicesCadastroCertificadoDigital = function(params){
        controllerAtual = controllerTaxServicesCadastroCertificadoDigital;
        go('tax-services-nota-fiscal-eletronica-cadastro-certificado-digital', params);
    };
    /**
      * Exibe como conteúdo a Nota Fiscal Eletrônica Recebimento Nfe, de Tax Services
      */
    $scope.goTaxServicesRecebimentoNfe = function(params){
        controllerAtual = controllerTaxServicesRecebimentoNfe;
        go('tax-services-nota-fiscal-eletronica-recebimento-nfe', params);
    };
    /**
      * Exibe a tela de perfil de conta
      */
    $scope.goMinhaConta = function(params){
        controllerAtual = controllerMinhaConta;
        go('minha-conta', params);
    };
    /**
      * Exibe a tela para alterar a senha do usuário
      */
    $scope.goMinhaContaAlterarSenha = function(params){
        controllerAtual = controllerMinhaConta;
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
        if(url === $state.get('administrativo-gestao-acessos-usuarios').url ||
           url === $state.get('administrativo-gestao-acessos-usuarios-cadastro').url){
            // Administrativo > Gestão de Acesso > Usuários (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_USUARIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'USUÁRIOS')
                     controllerAtual.id_controller !== controllerAdministrativoUsuarios.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual

        }else if(url === $state.get('administrativo-gestao-acessos-parametros-noticias').url){
            // Administrativo > Gestão de Acesso > Parâmetros de Notícias
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PARAMETROS_NOTICIAS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'PARÂMETROS DE NOTÍCIAS')
                     controllerAtual.id_controller !== controllerAdministrativoParametrosNoticias.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-gestao-acessos-privilegios').url){
            // Gestão de Acesso > Privilégios
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PRIVILEGIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'PRIVILÉGIOS')
                     controllerAtual.id_controller !== controllerAdministrativoPrivilegios.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-gestao-acessos-modulos-funcionalidades').url){
            // Gestão de Acesso > Módulos e Funcionalidades
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_MODULOS_FUNCIONALIDADES){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'MÓDULOS E FUNCIONALIDADES')
                     controllerAtual.id_controller !== controllerAdministrativoModulosFuncionalidades.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-gestao-empresas-empresas').url){
            // Gestão de Empresas > Empresas
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_EMPRESAS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'EMPRESAS')
                     controllerAtual.id_controller !== controllerAdministrativoEmpresas.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-gestao-empresas-filiais').url ||
                 url === $state.get('administrativo-gestao-empresas-filiais-cadastro').url){
            // Gestão de Empresas > Filiais (cadastro ou não)
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_FILIAIS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'FILIAIS')
                     controllerAtual.id_controller !== controllerAdministrativoFiliais.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-gestao-empresas-dados-acesso').url){
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_DADOS_ACESSO){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'DADOS DE ACESSO')
                     controllerAtual.id_controller !== controllerAdministrativoDadosAcesso.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-gestao-empresas-senhas-invalidas').url){
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_SENHAS_INVALIDAS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'DADOS DE ACESSO')
                     controllerAtual.id_controller !== controllerAdministrativoDadosAcesso.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-gestao-empresas-consulta-pos-terminal').url){
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS || !$scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_CONSULTA_POS_TERMINAL){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'SENHAS INVÁLIDAS')
                     controllerAtual.id_controller !== controllerAdministrativoConsultaPOSTerminal.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-dados-bancarios-contas-correntes').url ||
                 url === $state.get('administrativo-dados-bancarios-contas-correntes-vigencias').url){
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS || !$scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS_CONTAS_CORRENTES){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'CONTAS CORRENTES')
                     controllerAtual.id_controller !== controllerAdministrativoContasCorrentes.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-dados-bancarios-extratos-bancarios').url){
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS || !$scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS_EXTRATOS_BANCARIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'EXTRATOS BANCÁRIOS')
                     controllerAtual.id_controller !== controllerAdministrativoExtratosBancarios.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-dados-bancarios-parametros-bancarios').url){
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS || !$scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS_PARAMETROS_BANCARIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'PARÂMETROS BANCÁRIOS')
                     controllerAtual.id_controller !== controllerAdministrativoParametrosBancarios.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-logs-acesso-usuarios').url){
            // Logs > Acesso de usuários
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_LOGS || !$scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACESSO_USUARIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'ACESSO DE USUÁRIOS')
                     controllerAtual.id_controller !== controllerAdministrativoAcessoUsuarios.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-logs-acoes-usuarios').url){
            // Logs > Ações de usuários
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_LOGS || !$scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACOES_USUARIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'AÇÕES DE USUÁRIOS')
                     controllerAtual.id_controller !== controllerAdministrativoAcoesUsuarios.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-monitor-monitor-cargas').url){
            // Logs > Ações de usuários
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_MONITOR || !$scope.PERMISSAO_ADMINISTRATIVO_MONITOR_MONITOR_CARGAS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'AÇÕES DE USUÁRIOS')
                     controllerAtual.id_controller !== controllerAdministrativoMonitorCargas.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('administrativo-monitor-monitor-cargas-boot').url){ 
            // Administrativo > Monitor > Monitor de Cargas do Boot
            if(!$scope.PERMISSAO_ADMINISTRATIVO || !$scope.PERMISSAO_ADMINISTRATIVO_MONITOR || !$scope.PERMISSAO_ADMINISTRATIVO_MONITOR_MONITOR_CARGAS_BOOT){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'MONITOR DE CARGAS DO BOOT')
                     controllerAtual.id_controller !== controllerAdministrativoMonitorCargasBoot.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual 
        }else if(url === $state.get('dashboard').url){
            // Dashboard
            if(!$scope.PERMISSAO_DASHBOARD){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'DASHBOARD ATOS')
                     controllerAtual.id_controller !== controllerDashboard.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('card-services-cash-flow-relatorios').url){
            // Card Services > Cash Flow > Relatórios
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CASH_FLOW || !$scope.PERMISSAO_CARD_SERVICES_CASH_FLOW_RELATORIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'RELATÓRIOS') // problem!
                     controllerAtual.id_controller !== controllerCardServicesCashFlowRelatorios.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('card-services-conciliacao-conciliacao-bancaria').url){
            // Card Services > Conciliação > Conciliação Bancária
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_BANCARIA){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'CONCILIAÇÃO BANCÁRIA')
                     controllerAtual.id_controller !== controllerCardServicesConciliacaoBancaria.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('card-services-conciliacao-conciliacao-vendas').url){
            // Card Services > Conciliação > Conciliação de Vendas
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_VENDAS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'CONCILIAÇÃO DE VENDAS')
                     controllerAtual.id_controller !== controllerCardServicesConciliacaoVendas.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('card-services-conciliacao-conciliacao-terminal-logico').url){
            // Card Services > Conciliação > Conciliação Terminal Lógico
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_TERMINAL_LOGICO){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'CONCILIAÇÃO TERMINAL LÓGICO')
                     controllerAtual.id_controller !== controllerCardServicesConciliacaoTerminalLogico.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('card-services-conciliacao-conciliacao-vendas-dia').url){
            // Card Services > Conciliação > Conciliação de Vendas
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_VENDAS_DIA){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'CONCILIAÇÃO VENDAS DIA')
                     controllerAtual.id_controller !== controllerCardServicesConciliacaoVendasDia.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('card-services-conciliacao-relatorios').url){
            // Card Services > Conciliação > Relatórios
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO || !$scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_RELATORIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'RELÁTORIOS')
                     controllerAtual.id_controller !== controllerCardServicesConciliacaoRelatorios.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual    
        }else if(url === $state.get('card-services-consolidacao-relatorios').url){
            // Card Services > Consolidação > Relatórios
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_RELATORIOS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'RELATÓRIOS') // problem!
                     controllerAtual.id_controller !== controllerCardServicesConsolidacaoRelatorios.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('card-services-consolidacao-cadastro-codigo-autorizacao').url){
            // Card Services > Consolidação > Relatórios
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_CADASTRO_CODIGO_AUTORIZACAO){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'CADASTRO CÓDIGO AUTORIZAÇÃO')
                     controllerAtual.id_controller !== controllerCardServicesCadastroCodigoAutorizacao.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('card-services-consolidacao-lancamento-vendas').url){
            // Card Services > Consolidação > Lançamento de Vendas
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_LANCAMENTO_VENDAS){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'LANÇAMENTO DE VENDAS')
                     controllerAtual.id_controller !== controllerCardServicesLancamentoVendas.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('card-services-consolidacao-movimento-tef').url){
            // Card Services > Consolidação > Movimento TEF
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO || !$scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_MOVIMENTO_TEF){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'MOVIMENTO TEF')
                     controllerAtual.id_controller !== controllerCardServicesMovimentoTef.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('card-services-tef-movimento').url){
            // Card Services > TEF > Movimento
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_TEF || !$scope.PERMISSAO_CARD_SERVICES_TEF_MOVIMENTO){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'MOVIMENTO')
                     controllerAtual.id_controller !== controllerCardServicesMovimento.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('card-services-tef-resumo-de-movimento').url){
            // Card Services > TEF > Resumo de Movimento
            if(!$scope.PERMISSAO_CARD_SERVICES || !$scope.PERMISSAO_CARD_SERVICES_TEF || !$scope.PERMISSAO_CARD_SERVICES_TEF_RESUMO_DE_MOVIMENTO){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'RESUMO DE MOVIMENTO')
                     controllerAtual.id_controller !== controllerCardServicesResumoDeMovimento.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('tax-services-nota-fiscal-eletronica-importacao-xml').url){
            // Tax Services > Nota Fiscal Eletrônica > Importação XML
            if(!$scope.PERMISSAO_TAX_SERVICES || !$scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA || !$scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA_IMPORTACAO_XML){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'IMPORTÇÃO XML')
                     controllerAtual.id_controller !== controllerTaxServicesImportacaoXML.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('tax-services-nota-fiscal-eletronica-cadastro-certificado-digital').url){
            // Tax Services > Nota Fiscal Eletrônica > Cadastro Certificado Digital
            if(!$scope.PERMISSAO_TAX_SERVICES || !$scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA || !$scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA_CADASTRO_CERTIFICADO_DIGITAL){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'CADASTRO CERTIFICADO DIGITAL')
                     controllerAtual.id_controller !== controllerTaxServicesCadastroCertificadoDigital.id_controller)
                $scope.reloadPage(); // recarrega a página para forçar a associação do controllerAtual
        }else if(url === $state.get('tax-services-nota-fiscal-eletronica-recebimento-nfe').url){
            // Tax Services > Nota Fiscal Eletrônica > Recebimento NFE
            if(!$scope.PERMISSAO_TAX_SERVICES || !$scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA || !$scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA_RECEBIMENTO_NFE){
                // Não possui permissão!
                event.preventDefault();
                $scope.goUsuarioSemPrivilegios();
            }else if(!controllerAtual || //controllerAtual.ds_controller.toUpperCase() !== 'RECEBIMENTO NF-E')
                     controllerAtual.id_controller !== controllerTaxServicesRecebimentoNfe.id_controller)
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
            case 'PARÂMETROS DE NOTÍCIAS' :
                if($location.path() === $state.get('administrativo-gestao-acessos-parametros-noticias').url)
                    controllerAtual = controller;
                controllerAdministrativoParametrosNoticias = controller;
                return $scope.goAdministrativoParametrosNoticias;
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
            case 'DADOS DE ACESSO':
                if($location.path() === $state.get('administrativo-gestao-empresas-dados-acesso').url)
                    controllerAtual = controller;
                controllerAdministrativoDadosAcesso = controller;
                return $scope.goAdministrativoDadosAcesso;
            case 'SENHAS INVÁLIDAS':
                 if($location.path() === $state.get('administrativo-gestao-empresas-senhas-invalidas').url)
                    controllerAtual = controller;
                controllerAdministrativoSenhasInvalidas = controller;
                return $scope.goAdministrativoSenhasInvalidas;
            case 'CONSULTA POS/TERMINAL':
                 if($location.path() === $state.get('administrativo-gestao-empresas-consulta-pos-terminal').url)
                    controllerAtual = controller;
                controllerAdministrativoConsultaPOSTerminal = controller;
                return $scope.goAdministrativoConsultaPOSTerminal;
            case 'CONTAS CORRENTES':
                 if($location.path() === $state.get('administrativo-dados-bancarios-contas-correntes').url ||
                    $location.path() === $state.get('administrativo-dados-bancarios-contas-correntes-vigencias').url)
                    controllerAtual = controller;
                controllerAdministrativoContasCorrentes = controller;
                return $scope.goAdministrativoContasCorrentes;
            case 'EXTRATOS BANCÁRIOS':
                 if($location.path() === $state.get('administrativo-dados-bancarios-extratos-bancarios').url)
                    controllerAtual = controller;
                controllerAdministrativoExtratosBancarios = controller;
                return $scope.goAdministrativoExtratosBancarios;
            case 'PARÂMETROS BANCÁRIOS':
                if($location.path() === $state.get('administrativo-dados-bancarios-parametros-bancarios').url)
                    controllerAtual = controller;
                controllerAdministrativoParametrosBancarios = controller;
                return $scope.goAdministrativoParametrosBancarios;
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
            case 'MONITOR DE CARGAS':
                if($location.path() === $state.get('administrativo-monitor-monitor-cargas').url)
                    controllerAtual = controller;
                controllerAdministrativoMonitorCargas = controller;
                return $scope.goAdministrativoMonitorCargas;
            case 'MONITOR DE CARGAS DO BOOT':
                if($location.path() === $state.get('administrativo-monitor-monitor-cargas-boot').url) 
                    controllerAtual = controller;
                controllerAdministrativoMonitorCargasBoot = controller;
                return $scope.goAdministrativoMonitorCargasBoot;
            // Dashboard
            case 'DASHBOARD ATOS':
                if($location.path() === $state.get('dashboard').url) controllerAtual = controller;
                controllerDashboard = controller;
                return $scope.goDashboard;
            // Card Services
            case 'CONCILIAÇÃO BANCÁRIA':
                if($location.path() === $state.get('card-services-conciliacao-conciliacao-bancaria').url)
                    controllerAtual = controller;
                controllerCardServicesConciliacaoBancaria = controller;
                return $scope.goCardServicesConciliacaoBancaria;
            case 'CONCILIAÇÃO DE VENDAS':
                if($location.path() === $state.get('card-services-conciliacao-conciliacao-vendas').url)
                    controllerAtual = controller;
                controllerCardServicesConciliacaoVendas = controller;
                return $scope.goCardServicesConciliacaoVendas;
            case 'CONCILIAÇÃO TERMINAL LÓGICO':
                if($location.path() === $state.get('card-services-conciliacao-conciliacao-terminal-logico').url)
                    controllerAtual = controller;
                controllerCardServicesConciliacaoTerminalLogico = controller;
                return $scope.goCardServicesConciliacaoTerminalLogico;
            case 'CONCILIAÇÃO VENDAS DIA':
                if($location.path() === $state.get('card-services-conciliacao-conciliacao-vendas-dia').url)
                    controllerAtual = controller;
                controllerCardServicesConciliacaoVendasDia = controller;
                return $scope.goCardServicesConciliacaoVendasDia;
            case 'CADASTRO CÓDIGO AUTORIZAÇÃO':
                if($location.path() === $state.get('card-services-consolidacao-cadastro-codigo-autorizacao').url)
                    controllerAtual = controller;
                controllerCardServicesCadastroCodigoAutorizacao = controller;
                return $scope.goCardServicesCadastroCodigoAutorizacao;
            case 'LANÇAMENTO DE VENDAS':
                if($location.path() === $state.get('card-services-consolidacao-lancamento-vendas').url)
                    controllerAtual = controller;
                controllerCardServicesLancamentoVendas = controller;
                return $scope.goCardServicesLancamentoVendas;
            case 'MOVIMENTO TEF':
                if($location.path() === $state.get('card-services-consolidacao-movimento-tef').url)
                    controllerAtual = controller;
                controllerCardServicesMovimentoTef = controller;
                return $scope.goCardServicesMovimentoTef;    
            case 'MOVIMENTO':
                if($location.path() === $state.get('card-services-tef-movimento').url)
                    controllerAtual = controller;
                controllerCardServicesMovimento = controller;
                return $scope.goCardServicesMovimento; 
            case 'RESUMO DE MOVIMENTO':
                if($location.path() === $state.get('card-services-tef-resumo-de-movimento').url)
                    controllerAtual = controller;
                controllerCardServicesResumoDeMovimento = controller;
                return $scope.goCardServicesResumoDeMovimento;     
            // Tax Services
            case 'IMPORTAÇÃO XML':
                if($location.path() === $state.get('tax-services-nota-fiscal-eletronica-importacao-xml').url)
                    controllerAtual = controller;
                controllerTaxServicesImportacaoXML = controller;
                return $scope.goTaxServicesImportacaoXML;
            case 'CADASTRO CERTIFICADO DIGITAL':
                if($location.path() === $state.get('tax-services-nota-fiscal-eletronica-cadastro-certificado-digital').url)
                    controllerAtual = controller;
                controllerTaxServicesCadastroCertificadoDigital = controller;
                return $scope.goTaxServicesCadastroCertificadoDigital;
            case 'RECEBIMENTO NF-E':
                if($location.path() === $state.get('tax-services-nota-fiscal-eletronica-recebimento-nfe').url)
                    controllerAtual = controller;
                controllerTaxServicesRecebimentoNfe = controller;
                return $scope.goTaxServicesRecebimentoNfe;

            // AMBÍGUOS
            case 'RELATÓRIOS':
                if(controllerpai.ds_controller.toUpperCase() === 'CASH FLOW'){
                    if($location.path() === $state.get('card-services-cash-flow-relatorios').url)
                        controllerAtual = controller;
                    controllerCardServicesCashFlowRelatorios = controller;
                    return $scope.goCardServicesCashFlowRelatorios;
                }
                if(controllerpai.ds_controller.toUpperCase() === 'CONSOLIDAÇÃO'){
                    if($location.path() === $state.get('card-services-consolidacao-relatorios').url)
                        controllerAtual = controller;
                    controllerCardServicesConsolidacaoRelatorios = controller;
                    return $scope.goCardServicesConsolidacaoRelatorios;
                }
                if($location.path() === $state.get('card-services-conciliacao-relatorios').url)
                    controllerAtual = controller;
                controllerCardServicesConciliacaoRelatorios = controller;
                return $scope.goCardServicesConciliacaoRelatorios;
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
            case 'PARÂMETROS DE NOTÍCIAS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PARAMETROS_NOTICIAS = true; break;
            case 'PRIVILÉGIOS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_PRIVILEGIOS = true; break;
            case 'MÓDULOS E FUNCIONALIDADES' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_ACESSOS_MODULOS_FUNCIONALIDADES = true; break;
            case 'GESTÃO DE EMPRESAS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS = true; break;
            case 'EMPRESAS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_EMPRESAS = true; break;
            case 'FILIAIS' : $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_FILIAIS = true; break;
            case 'DADOS DE ACESSO': $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_DADOS_ACESSO = true; break;
            case 'SENHAS INVÁLIDAS': $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_SENHAS_INVALIDAS = true; break;
            case 'CONSULTA POS/TERMINAL': $scope.PERMISSAO_ADMINISTRATIVO_GESTAO_DE_EMPRESAS_CONSULTA_POS_TERMINAL = true; break;
            case 'DADOS BANCÁRIOS': $scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS = true; break;
            case 'CONTAS CORRENTES': $scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS_CONTAS_CORRENTES = true; break;
            case 'EXTRATOS BANCÁRIOS': $scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS_EXTRATOS_BANCARIOS = true; break;
            case 'PARÂMETROS BANCÁRIOS': $scope.PERMISSAO_ADMINISTRATIVO_DADOS_BANCARIOS_PARAMETROS_BANCARIOS = true; break;
            case 'LOGS' : $scope.PERMISSAO_ADMINISTRATIVO_LOGS = true; break;
            case 'ACESSO DE USUÁRIOS' : $scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACESSO_USUARIOS = true; break;
            case 'AÇÕES DE USUÁRIOS': $scope.PERMISSAO_ADMINISTRATIVO_LOGS_ACOES_USUARIOS = true; break;
            case 'MONITOR': $scope.PERMISSAO_ADMINISTRATIVO_MONITOR = true; break;
            case 'MONITOR DE CARGAS': $scope.PERMISSAO_ADMINISTRATIVO_MONITOR_MONITOR_CARGAS = true; break;
            case 'MONITOR DE CARGAS DO BOOT': $scope.PERMISSAO_ADMINISTRATIVO_MONITOR_MONITOR_CARGAS_BOOT = true; break;
            // Dashboard
            case 'DASHBOARD ATOS': $scope.PERMISSAO_DASHBOARD = true; break;
            // Tax Services
            case 'TAX SERVICES' : $scope.PERMISSAO_TAX_SERVICES = true; break;
            case 'NOTA FISCAL ELETRÔNICA': $scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA = true; break;
            case 'IMPORTAÇÃO XML':  $scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA_IMPORTACAO_XML = true; break;
            case 'CADASTRO CERTIFICADO DIGITAL': $scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA_CADASTRO_CERTIFICADO_DIGITAL = true;
            case 'RECEBIMENTO NF-E': $scope.PERMISSAO_TAX_SERVICES_NOTA_FISCAL_ELETRONICA_RECEBIMENTO_NFE = true; break;
            // Card Services
            case 'CARD SERVICES': $scope.PERMISSAO_CARD_SERVICES = true; break;
            case 'CASH FLOW' : $scope.PERMISSAO_CARD_SERVICES_CASH_FLOW = true; break;
            case 'TEF' : $scope.PERMISSAO_CARD_SERVICES_TEF = true; break;
            case 'CONCILIAÇÃO': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO = true; break;
            case 'CONCILIAÇÃO BANCÁRIA': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_BANCARIA = true; break;
            case 'CONCILIAÇÃO DE VENDAS': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_VENDAS = true; break;
            case 'CONCILIAÇÃO TERMINAL LÓGICO': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_TERMINAL_LOGICO = true; break;
            case 'CONCILIAÇÃO VENDAS DIA': $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_VENDAS_DIA = true; break;
            case 'CONSOLIDAÇÃO': $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO = true; break;
            case 'CADASTRO CÓDIGO AUTORIZAÇÃO': $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_CADASTRO_CODIGO_AUTORIZACAO = true; break;
            case 'LANÇAMENTO DE VENDAS': $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_LANCAMENTO_VENDAS = true; break;
            case 'MOVIMENTO' : $scope.PERMISSAO_CARD_SERVICES_TEF_MOVIMENTO = true; break;
            case 'RESUMO DE MOVIMENTO' : $scope.PERMISSAO_CARD_SERVICES_TEF_RESUMO_DE_MOVIMENTO = true; break;
            case 'MOVIMENTO TEF' : $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_MOVIMENTO_TEF = true; break;    

            // AMBÍGUOS
            case 'RELATÓRIOS': controllerpai.ds_controller.toUpperCase() === 'CASH FLOW' ?
                                $scope.PERMISSAO_CARD_SERVICES_CASH_FLOW_RELATORIOS = true  :
                               controllerpai.ds_controller.toUpperCase() === 'CONSOLIDAÇÃO' ?
                                $scope.PERMISSAO_CARD_SERVICES_CONSOLIDACAO_RELATORIOS = true :
                                $scope.PERMISSAO_CARD_SERVICES_CONCILIACAO_CONCILIACAO_RELATORIOS = true;
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
            // Tax Services
            case 'TAX SERVICES' : return state == 'tax-services';

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
            case 'PARÂMETROS DE NOTÍCIAS' : return state == 'parametros-noticias';
            case 'PRIVILÉGIOS' : return state == 'privilegios';
            case 'MÓDULOS E FUNCIONALIDADES' : return state == 'modulos-funcionalidades';
            case 'EMPRESAS' : return state == 'empresas';
            case 'FILIAIS' :  return state == 'filiais' || state == 'cadastro-filiais';
            case 'DADOS DE ACESSO': return state == 'dados-acesso';
            case 'SENHAS INVÁLIDAS': return state == 'senhas-invalidas';
            case 'CONSULTA POS/TERMINAL': return state == 'consulta-pos-terminal';
            case 'CONTAS CORRENTES': return state == 'contas-correntes' || state == 'conta-corrente-vigencias';
            case 'EXTRATOS BANCÁRIOS': return state == 'extratos-bancarios';
            case 'PARÂMETROS BANCÁRIOS': return state == 'parametros-bancarios';
            case 'ACESSO DE USUÁRIOS' : return state == 'acesso-usuarios';
            case 'AÇÕES DE USUÁRIOS': return state == 'acoes-usuarios';
            case 'MONITOR DE CARGAS': return state == 'monitor-cargas';
            case 'MONITOR DE CARGAS DO BOOT': return state == 'monitor-cargas-boot'; 
            // Tax Services
            case 'IMPORTAÇÃO XML': return state == 'importacao-xml';
            case 'CADASTRO CERTIFICADO DIGITAL': return state == 'cadastro-certificado-digital';
            case 'RECEBIMENTO NF-E': return state == 'recebimento-nfe';
            // Card Services
            case 'CONCILIAÇÃO BANCÁRIA': return state == 'conciliacao-bancaria';
            case 'CONCILIAÇÃO DE VENDAS': return state == 'conciliacao-vendas';
            case 'CONCILIAÇÃO TERMINAL LÓGICO': return state == 'conciliacao-terminal-logico';
            case 'CONCILIAÇÃO DE VENDAS DIA': return state == 'conciliacao-vendas-dia';
            case 'CADASTRO CÓDIGO AUTORIZAÇÃO': return state == 'cadastro-codigo-autorizacao';
            case 'LANÇAMENTO DE VENDAS': return state == 'lancamento-vendas';
            case 'MOVIMENTO': return state == 'movimento';  
            case 'RESUMO DE MOVIMENTO': return state == 'resumo-de-movimento';
            case 'MOVIMENTO TEF': return state == 'movimento-tef';

            // AMBÍGUOS
            case 'RELATÓRIOS': return titulopai.toUpperCase() === 'CASH FLOW' ?
                                state == 'cash-flow-relatorios' :
                                      titulopai.toUpperCase() === 'CONSOLIDAÇÃO' ?
                                state == 'consolidacao-relatorios':
                                state == 'concilicao-relatorios';

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

        //console.log(data.id_grupo);

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
        $rootScope.token = $scope.token = $autenticacao.getToken();
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
                                  {id:/*$campos.cliente.grupoempresa.id_grupo*/ 100, valor: empresaId}))
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
                                  {id:/*$campos.cliente.empresa.nu_cnpj*/ 100, valor: nu_cnpj}))
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
                              [$scope.token, 0, /*$campos.cliente.grupoempresa.ds_nome*/ 101, 0, 10, 1], // ordenado crescente com 10 itens no máximo
                              {id:/*$campos.cliente.grupoempresa.ds_nome*/ 101, valor: texto + '%'});
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
     * @param reset : por default ele é true. Set false para não remover outros alerts da tela
     */
   $scope.showAlert = function(mensagem, closable, type, scroll, reset){
        jQuery(document).ready(function() {
        //$rootScope.$on('$viewContentLoaded', function(){
           $timeout(function(){
                   alertId = Metronic.alert({
                    container: '', // alerts parent container(by default placed after the page breadcrumbs)
                    place: 'append', // append or prepent in container
                    type: type ? type : 'info',  // alert's type
                    message: mensagem ? mensagem : 'Por favor, aguarde',  // alert's message
                    close: closable ? true : false, // make alert closable
                    reset: typeof reset === 'undefined' ? true : reset, // close all previouse alerts first
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
    var fechaModalAlerta = function(){
        $('#modalAlerta').modal('hide');
    };
    /**
      * Exibe modal com a mensagem de alerta
      */
    $scope.showModalAlerta = function(mensagem, titulo, textoOk, funcaoOk){
        $scope.alerta.titulo = titulo ? titulo : 'Info';
        $scope.alerta.mensagem = mensagem ? mensagem : 'Mensagem';
        $scope.alerta.textoOk = textoOk ? textoOk : 'Ok';
        $scope.alerta.funcaoOk = typeof funcaoOk === 'function' ?
                                    function(){fechaModalAlerta(); funcaoOk();}  :
                                    function(){fechaModalAlerta()};
        // Exibe o modal
        $('#modalAlerta').modal('show');
        if(!$scope.$$phase) $scope.$apply();
    }


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
        //console.log(div);
        if(div.length == 0){
            // Verifica se está em full screen
            div = $('div[class="portlet light portlet-fullscreen"]');
            if(div.length == 0) return undefined;
        }
        var body = div.children(".portlet-body");
        //console.log(body);
        if(divPortletBodyPos < 0 || divPortletBodyPos >= body.length) return undefined;
        return body[divPortletBodyPos];
   }
   /**
     * Exibe o loading progress no portlet-body
     */
   $scope.showProgress = function(divPortletBodyPos, zIndex){
        var el = getElementProgress(divPortletBodyPos);
        //console.log("ELEMENT"); console.log(el);
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
     * A partir da data em string do tipo dd/MM/yyyy, retorna um Date, com horário zerado
     */
   $scope.getDataFromString = function(dataString){
       var dt = dataString.split('/');
       return $filter('date')(new Date(dt[2], dt[1] - 1, dt[0], 0, 0, 0, 0), "yyyy-MM-dd HH:mm:ss");
   }
   /**
     * A partir da data proveniente do banco de dados, retorna um Date, com horário zerado
     */
   $scope.getDataFromDate = function(date){
       return $filter('date')(new Date(date.replace("T", " ")), "yyyy-MM-dd HH:mm:ss")
   }
   /**
     * Retorna a data do tipo Date yyyy-MM-dd em string dd/MM/yyyy
     */
   $scope.getDataString = function(data){
        if(typeof data !== 'undefined' && data !== null){
            if(typeof data.getDate === 'function')
                return data.getDate() + '/' + (data.getMonth() + 1) + '/' +  data.getFullYear();
            return data.substr(8, 2) + '/' + data.substr(5, 2) + '/' + data.substr(0, 4);
        }
        return '';
   };
   $scope.getDataTimeString = function(data){
        // 2015-07-21T10:51:15.917
        if(typeof data !== 'undefined' && data !== null){
            var dt = data.substr(8, 2) + '/' + data.substr(5, 2) + '/' + data.substr(0, 4) +
                     ' ' + data.substr(11,8);
            var index = dt.indexOf('-');
            if(index > -1) dt = dt.substr(0, index);
            return dt;
        }
        return '';
   };
   $scope.getTimeString = function(data){
        // 2015-07-21T10:51:15.917
        if(typeof data !== 'undefined' && data !== null)
            return data.substr(11,8);
        return '';
   };
   /**
      * Retorna a string aceita para filtro de data
      * OBS: ano é obrigatório
      */
   $scope.getFiltroDataString = function(ano, mes, dia){
        if(ano >= 1000) ano = '' + ano;
        else if(ano >= 100) ano = '0' + ano;
        else if(ano >= 10) ano = '00' + ano;
        else ano = '000' + ano;

        if(!mes) return ano;

        if(mes >= 10) mes = '' + mes;
        else mes = '0' + mes;

        if(!dia) return ano + mes;
        if(dia >= 10) dia = '' + dia;
        else dia = '0' + dia;

        return ano + mes + dia;
   }
   /**
      * Retorna a string aceita para filtro de data
      */
   $scope.getFiltroData = function(data, semdia){
        var ano = data.getFullYear();
        var mes = (data.getMonth() + 1);
        var dia = data.getDate();
        var valor = $scope.getFiltroDataString(ano, mes, dia);

        if(semdia) return valor.substr(0, 6);
        return valor;
    };


    /**
      * Retorna o nome fantasia da filial seguido do campo filial
      */
    $scope.getNomeAmigavelFilial = function(filial){
        if(!filial) return '';
        var nome = filial.ds_fantasia;
        if(filial.filial && filial.filial !== null) nome += ' ' + filial.filial;
        return nome.toUpperCase();
    }

    /**
      * Retorna o nome fantasia da filial seguido do campo filial seguido de '-' e o nome da operadora
      */
    $scope.getNomeLoginOperadoraAmigavel = function(filial, operadora, empresa){
        if(empresa) return empresa.ds_nome.toUpperCase() + ' - ' + $scope.getNomeAmigavelFilial(filial) + ' - ' + operadora.nmOperadora.toUpperCase();
        return $scope.getNomeAmigavelFilial(filial) + ' - ' + operadora.nmOperadora.toUpperCase();
    }

    /**
      * Exibe o código do banco seguido do nome (reduzido ou extenso)
      */
    $scope.exibeBanco = function(banco, reduzido){
        if(typeof banco === 'undefined' || banco === null) return '';
        var text = banco.Codigo + '    ';
        if(reduzido) text += banco.NomeReduzido;
        else text += banco.NomeExtenso;
        return text.toUpperCase();
    }
    /**
      * Substitui na string os '\n' e coloca a quebra de linha do html
      * /
    $scope.adicionaQuebraLinhaHtml = function(text){
        console.log(text);
        if(typeof text === 'string') return text.split("\n").join(String.fromCharCode(160));
        return text;
    }*/







    /**
      * Requisita o download
      * @param url
      * @param arquivo : nome do arquivo
      */
    $scope.download = function(url, arquivo, exibirProgress, divPosPrincipal, divPosFiltro, funcaoSucesso, funcaoErro){
        if(exibirProgress){
            if(typeof divPosPrincipal === 'number'){
                $scope.showProgress(divPosPrincipal); // z-index < z-index do fullscreen
                if(typeof divPosFiltro === 'number')
                    $scope.showProgress(divPosFiltro, 10000);
            }else
                $scope.showProgress(); // sobre a página
        }

        $http.get(url, {responseType: 'arraybuffer'})
            .success(function(data, status, headers, config){
                //console.log(dados);

                var octetStreamMime = 'application/octet-stream';
                var success = false;

                // Get the headers
                headers = headers();

                //console.log(headers);

                // Get the filename from the x-filename header or default to "download.bin"
                var filename = headers['x-filename'] || arquivo;

                // Determine the content type from the header or default to "application/octet-stream"
                var contentType = headers['content-type'] || octetStreamMime;

                try
                {
                    // Try using msSaveBlob if supported
                    //console.log("Trying saveBlob method ...");
                    var blob = new Blob([data], { type: contentType });
                    if(navigator.msSaveBlob)
                        navigator.msSaveBlob(blob, filename);
                    else {
                        // Try using other saveBlob implementations, if available
                        var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
                        if(saveBlob === undefined) throw "Not supported";
                        saveBlob(blob, filename);
                    }
                    //console.log("saveBlob succeeded");
                    success = true;
                } catch(ex)
                {
                    //console.log("saveBlob method failed with the following exception:");
                    //console.log(ex);
                }

                if(!success)
                {
                    // Get the blob url creator
                    var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                    if(urlCreator)
                    {
                        // Try to use a download link
                        var link = document.createElement('a');
                        if('download' in link)
                        {
                            // Try to simulate a click
                            try
                            {
                                // Prepare a blob URL
                                //console.log("Trying download link method with simulated click ...");
                                var blob = new Blob([data], { type: contentType });
                                var url = urlCreator.createObjectURL(blob);
                                link.setAttribute('href', url);

                                // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
                                link.setAttribute("download", filename);

                                // Simulate clicking the download link
                                var event = document.createEvent('MouseEvents');
                                event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                                link.dispatchEvent(event);
                                //console.log("Download link method with simulated click succeeded");
                                success = true;

                            } catch(ex) {
                                //console.log("Download link method with simulated click failed with the following exception:");
                                //console.log(ex);
                            }
                        }

                        if(!success)
                        {
                            // Fallback to window.location method
                            try
                            {
                                // Prepare a blob URL
                                // Use application/octet-stream when using window.location to force download
                                //console.log("Trying download link method with window.location ...");
                                var blob = new Blob([data], { type: octetStreamMime });
                                var url = urlCreator.createObjectURL(blob);
                                window.location = url;
                                //console.log("Download link method with window.location succeeded");
                                success = true;
                            } catch(ex) {
                                //console.log("Download link method with window.location failed with the following exception:");
                                //console.log(ex);
                            }
                        }

                    }
                }

                if(!success)
                {
                    // Fallback to window.open method
                    //console.log("No methods worked for saving the arraybuffer, using last RESORT window.open");
                    window.open(url, '_blank', '');
                }

                // função sucesso
                if(typeof funcaoSucesso === 'function')
                    funcaoSucesso();


                // Fecha os progress
                if(exibirProgress){
                    if(typeof divPosPrincipal === 'number'){
                        $scope.hideProgress(divPosPrincipal); // z-index < z-index do fullscreen
                        if(typeof divPosFiltro === 'number')
                            $scope.hideProgress(divPosFiltro);
                    }else
                        $scope.hideProgress(); // sobre a página
                }
            }).error(function(data, status, headers, config){
                 if(status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                 else if(status === 503 || status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao realizar o download (' + status + ')', true, 'danger', true);

                 // função sucesso
                 if(typeof funcaoErro === 'function')
                    funcaoErro();

                 // Fecha os progress
                 if(exibirProgress){
                    if(typeof divPosPrincipal === 'number'){
                        $scope.hideProgress(divPosPrincipal); // z-index < z-index do fullscreen
                        if(typeof divPosFiltro === 'number')
                            $scope.hideProgress(divPosFiltro);
                    }else
                        $scope.hideProgress(); // sobre a página
                 }
            });
    }



}])



// Init global settings and run the app
.run(['$rootScope', '$location', function($rootScope, $location) {
    // Título da página
    $rootScope.$on('$stateChangeSuccess', function (event, current, previous) {
        if(current.data) $rootScope.titulo = current.data.titulo;
    });
}]);
