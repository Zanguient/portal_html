/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 06/11/2015
 *
 */

// App
angular.module("administrativo-consulta-parametros", []) 

.controller("administrativo-consulta-parametrosCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            function($scope,$state,$http,/*$campos,*/
                                                     $webapi,$apis,$filter){ 
   
    var divPortletBodyFiltroPos = 0; // posição da div que vai receber o loading progress                             
    var divPortletBodyParametrosPos = 1; // posição da div que vai receber o loading progress   
    // flags
    $scope.exibeTela = false;                                            
                                                
                                                
    // Inicialização do controller
    $scope.administrativo_consultaParametrosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Consulta Parâmetros';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca
            // ...
        }); 
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        // Busca 
        // ...
    }; 
                                                
                                                
    // ....

}])