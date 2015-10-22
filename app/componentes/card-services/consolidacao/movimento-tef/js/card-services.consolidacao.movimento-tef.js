/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 22/10/2015
 *
 */

// App
angular.module("card-services-consolidacao-movimento-tef", []) 

.controller("card-services-consolidacao-movimento-tefCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             '$autenticacao',             
                                             function($scope,$state,$filter,$timeout,
                                                      /*$campos,*/$webapi,$apis,$autenticacao){ 
    
    // Exibição
    $scope.itens_pagina = [50, 100, 150, 200]; 
    $scope.paginaInformada = 1; // página digitada pelo usuário 
    $scope.resumos_movimento = [{bandeiras:[{bandeira:'Cielo', bandeira:'Master'}],
                                 transacoes:[{transacao:1},{transacao:2}],
                                 quantidades:[{quantidade:15},{quantidade:20}]  ,
                                 valores:[{valor:56},{valor:98}]  ,
                                }]; 
    
    // Filtros
    
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;                                           
                                                 
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRelatorioPos = 1; // posição da div que vai receber o loading progress
    $scope.tab = 2; // init Sintético
    
    // Relatórios
    $scope.relatorio = {terminal : [], sintetico : [], analitico : []};                                             
    // Totais
    $scope.total = {terminal  : {totalTransacoes : 0, valorBruto : 0, 
                                 totalTransacoesFiltrado : 0, valorBrutoFiltrado : 0}, 
                    sintetico : {totalTransacoes : 0, valorBruto : 0,
                                 totalTransacoesFiltrado : 0, valorBrutoFiltrado : 0}, 
                    analitico : {valorBruto : 0, valorBrutoFiltrado : 0}};                                              
    // flag
    var ultimoFiltro = undefined;
    $scope.exibeTela = false;  
    $scope.buscandoRelatorio = false;                                             
                                                 
                                                 
    // Inicialização do controller
    $scope.cardServices_consolidacao_movimento_tefInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Consolidação - movimento TEF';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.filial = $scope.filtro.adquirente = $scope.filtro.bandeira = $scope.filtro.terminallogico = null;
                    buscaFiliais();
                }else{ // reseta tudo e não faz buscas 
                    $scope.filiais = []; 
                    $scope.adquirentes = [];
                    $scope.bandeiras = [];
                    $scope.terminais = [];
                }
            }
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega filiais
            if($scope.usuariologado.grupoempresa) buscaFiliais();
        }); 
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Carrega filiais
        //if($scope.usuariologado.grupoempresa) buscaFiliais(true);
    };
    
     
        var buscaFiliais = function(){

       var filtros = [];

       // Somente com status ativo
       filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1}); 

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros.push({id: /*$campos.cliente.empresa.cdGrupo*/ 116, 
                       valor: $scope.usuariologado.grupoempresa.id_grupo});
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 //else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
              });     
    };                                             
                                                 
    //TAB 
    /**
      * Retorna true se a tab informada corresponde a tab em exibição
      */
    $scope.tabIs = function (tab){
        return $scope.tab === tab;
    }
    /**
      * Altera a tab em exibição
      */
    $scope.setTab = function (tab){
        if (tab >= 1 && tab <= 2) $scope.tab = tab;  
    }
     
    console.log($scope.resumos_movimento);    
}]);