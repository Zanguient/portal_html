/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("card-services-conciliacao-vendas-dia", []) 

.controller("card-services-conciliacao-vendas-diaCtrl", ['$scope','$state',function($scope,$state){ 
    
    // flags
    $scope.exibeTela = false;
    // Data
    $scope.emitentes = [];
    $scope.datamin = new Date();
    $scope.datamax = null;
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;
    
    // Inicialização do controller
    $scope.cardServices_conciliacaoVendasDiaInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Conciliação Vendas Dia';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            // ....
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
    };
    
    // DATA
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.datamax !== null && $scope.datamax < $scope.datamin) $scope.datamax = $scope.datamin;
      if(!$scope.$$phase) $scope.$apply();
    };
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataMin = function(){
      ajustaIntervaloDeData();
    };
    // Data MAX
    $scope.exibeCalendarioDataMax = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
        $scope.abrirCalendarioDataMin = false;
      };
    $scope.alterouDataMax = function(){
      ajustaIntervaloDeData();
    };
    $scope.limpaDataMax = function () {
        $scope.datamax = null;
      };
        
    // TABS
    /**
      * Seta a tab
      */
    $scope.setTab = function(tab){
        if(typeof tab === 'number' && tab >= 0 && tab < 3){ 
            $scope.tab = tab;
            if($scope.tabIs(0)){
                $scope.paginaInformada = $scope.filtro.terminal.pagina;
                if($scope.relatorio.terminal.length == 0 && 
                   ($scope.relatorio.sintetico.length > 0 || 
                    $scope.relatorio.analitico.length > 0)) 
                        buscaRelatorioTerminal(false);   
            }else if($scope.tabIs(1)){
                $scope.paginaInformada = $scope.filtro.sintetico.pagina;
                if($scope.relatorio.sintetico.length == 0 && 
                   ($scope.relatorio.terminal.length > 0 || 
                    $scope.relatorio.analitico.length > 0)) 
                        buscaRelatorioSintetico(false);   
            }else if($scope.tabIs(2)){
                $scope.paginaInformada = $scope.filtro.analitico.pagina;
                if($scope.relatorio.analitico.length == 0 && 
                   ($scope.relatorio.terminal.length > 0 || 
                    $scope.relatorio.sintetico.length > 0)) 
                        buscaRelatorioAnalitico(false, false);   
            }
        }
    }
    
        // EMITENTE
    $scope.toggle = function(emitente){
        if(!emitente || emitente === null) return;
        if(emitente.collapsed) emitente.collapsed = false;
        else emitente.collapsed = true;
    }
    $scope.isExpanded = function(emitente){
        if(!emitente || emitente === null) return;
        return emitente.collapsed;
    }
    
    /**
      * Retorna true se a tab selecionada é inforamda
      */
    $scope.tabIs = function(tab){
        return $scope.tab === tab;
    }
    
    
}]);