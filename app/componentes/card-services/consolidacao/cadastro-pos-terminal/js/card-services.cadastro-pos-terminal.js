/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão: 1.0 - 03/09/2015
 *
 */

// App
angular.module("card-services-cadastro-pos-terminal", []) 

.controller("card-services-cadastro-pos-terminalCtrl", ['$scope','$state',function($scope,$state){ 
    
    // flags
    $scope.exibeTela = false;
    // Data
    $scope.datamin = new Date();
    $scope.datamax = null;
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;
    
    // Inicialização do controller
    $scope.cardServices_cadastroPOSTerminalInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Cadastro POS/Terminal';
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
    
}]);