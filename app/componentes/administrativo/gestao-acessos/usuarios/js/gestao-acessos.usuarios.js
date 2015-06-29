/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-usuarios", ['servicos']) 

.controller("administrativo-usuariosCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            '$campos',
                                            '$webapi',
                                            '$apis',
                                            '$filter',
                                            '$autenticacao', 
                                            function($scope,$state,$http,$campos,
                                                     $webapi,$apis,$filter,$autenticacao){ 
    var token = '';
    $scope.usuarios = [];
    $scope.camposBusca = [
                          {
                            id: $campos.administracao.webpageusers.ds_email,
                            nome: "E-mail"
                          },{
                            id: $campos.administracao.webpageusers.ds_login,
                            nome: "Login"
                          },{
                            id: $campos.administracao.webpageusers.id_grupo,
                            nome: "Grupo Empresa"
                          },{
                            id: $campos.administracao.webpageusers.nu_cnpjEmpresa,
                            nome: "CNPJ da Empresa"
                          },
                         ];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.usuario = {busca:'',campo_busca : $scope.camposBusca[0], itens_pagina : $scope.itens_pagina[0], pagina : 1, total : 0, total_paginas : 0};
                                                
    // Inicialização do controller
    $scope.administrativoUsuariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Usuários';
        // Token
        token = $autenticacao.getToken();
        // Busca Usuários
        $scope.buscaUsuarios();
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state){
            $state.go(state);
        });
    };   
                                                
    // PAGINAÇÃO
    $scope.retrocedePagina = function(){
        if($scope.usuario.pagina > 1){ 
            $scope.usuario.pagina--;  
            $scope.buscaUsuarios();
        }
    };
    $scope.avancaPagina = function(){
        if($scope.usuario.pagina < $scope.usuario.total){ 
            $scope.usuario.pagina++; 
            $scope.buscaUsuarios();
        }
    };
     
    // BUSCA
    $scope.buscaUsuarios = function(){
       // FAZER CONSIDERANDO O FILTRO!
       $scope.obtendoUsuarios = true;
       var dadosAPI = $webapi.get($apis.administracao.webpageusers, [token, 0, $scope.usuario.campo_busca.id, 0, 
                                                                     $scope.usuario.itens_pagina, $scope.usuario.pagina]); 
       dadosAPI.then(function(dados){
                $scope.usuarios = dados.Registros;
                $scope.usuario.total = dados.TotalDeRegistros;
                $scope.obtendoUsuarios = false;
              },
              function(failData){
                 console.log("FALHA AO OBTER ROLES: " + failData.status);
                 $scope.obtendoUsuarios = false;
              }); 
    };
    
    $scope.filtraUsuarios = function(){
        // FAZER!
    };
}])