/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 19/10/2015
 *
 */

// App
angular.module("card-services-movimento", []) 

.controller("card-services-movimentoCtrl", ['$scope',   
                                            '$state',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',
                                            '$filter',
                                            function($scope,$state,/*$campos,*/
                                                     $webapi,$apis,$timeout,$filter){  
    
    
    // Filtro
    $scope.abrirCalendarioDataMin = false;
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyAutorizacaoPos = 1; // posição da div que vai receber o loading progress 
    // flags
    $scope.abrirCalendarioData = false;
    $scope.exibeTela = false;
    
    
    // Inicialização do controller
    $scope.cardServices_movimentoInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Movimento';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    
                }else{ // reseta tudo e não faz buscas 
                    $scope.lojas = []; 
                    $scope.sacados = [];
                    $scope.pdvs = [];
                }
            }
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            
        });
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
       
    };
                                                
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataMin = function(){
         ajustaIntervaloDeData(); 
    };                                            
    
}]);
