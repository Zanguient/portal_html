/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("dashboard", ['ngFileUpload']) 

.controller("dashboardCtrl", ['$scope',
                              '$state',
                              '$timeout',
                              '$webapi',
                              '$apis',
                              'Upload',
                            function($scope,$state,$timeout,$webapi,$apis,Upload){ 
    
    $scope.extrato = undefined;                            
                                
    // Inicialização do controller
    $scope.dashboardInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Dashboard';                          
        $scope.pagina.subtitulo = 'Resumo do dia';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
         // Focus
         /*$timeout(function() {
             jQuery('body').trigger('click');
          }, 500);*/
    }
    
    
    
    // UPLOAD
    var uploadEmProgresso = false;
    $scope.progresso = 0;
    $scope.type = 'info';
    $scope.current = 0;
    $scope.total = 0;
    $scope.uploadEmProgresso = function(){
        return uploadEmProgresso;    
    }
    
    $scope.upload = function (files) {
        if (files && files.length) {
            uploadEmProgresso = true;
            $scope.type = 'info';
            $scope.progresso = 0;
            $scope.total = files.length;
            $scope.current = 0;
            for (var i = 0; i < $scope.total; i++) {
                var file = files[i];
                Upload.upload({
                    url: $apis.getUrl($apis.card.tbextrato, $scope.token, 
                                      {id: /*$campos.card.tbextrato.cdContaCorrente*/ 101, valor: 1}),
                    file: file,
                    method: 'PATCH'
                }).progress(function (evt) {
                    $scope.progresso = parseInt(100.0 * evt.loaded / evt.total);
                }).success(function (data, status, headers, config) {
                    $timeout(function() {
                        if(++$scope.current === $scope.total){
                            $scope.type = 'success';
                            uploadEmProgresso = false;
                        }
                        console.log(data);
                    });
                }).error(function (data, status, headers, config){
                    console.log("ERROR : " + status);
                    console.log(data);
                    if(++$scope.current === $scope.total){
                        $scope.type = 'danger';
                        uploadEmProgresso = false;
                    }
                });
            }
        }
    };
    
    
}]);