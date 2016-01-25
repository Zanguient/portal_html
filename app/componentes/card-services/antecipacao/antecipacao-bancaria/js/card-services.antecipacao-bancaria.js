/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 04/01/2016
 *
 */

// App
angular.module("card-services-antecipacao-bancaria", []) 

.controller("card-services-antecipacao-bancariaCtrl", ['$scope',
                              '$state',
                              '$window',
                              '$webapi',
                              '$apis',
                            function($scope,$state,$window,$webapi,$apis){ 
                                  
    // Flags
    $scope.exibeTela = false;                           
                                
    // Inicialização do controller
    $scope.cardServices_antecipacaoBancariaInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Antecipação Bancária';
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
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
    }
    
    
}]);